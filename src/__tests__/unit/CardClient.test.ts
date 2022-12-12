// @ts-nocheck

import { CardClient } from '../../Client/CardClient';
import { Response } from '../../Lib/fetch';
import { IConnection } from '../../Client/Connection';
import { RawSignedModel } from '../../Cards/RawSignedModel';

describe('CardClient', () => {
	describe('publishCard', () => {
		it ('rejects with custom error on http 401', () => {
			const connectionStub = {
				get: sinon.stub().throws(),
				post: sinon.stub().returns(
					Promise.resolve(
						new Response(
							JSON.stringify({ code: '40100', message: 'Invalid token' }),
							{ status: 401, statusText: 'Unauthorized' }
						)
					)
				)
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.publishCard({} as RawSignedModel, 'not_a_valid_jwt'),
				'Invalid token'
			);
		});

		it ('rejects with custom error on http 400', () => {
			const connectionStub = {
				get: sinon.stub().throws(),
				post: sinon.stub().returns(
					Promise.resolve(
						new Response(
							JSON.stringify({ code: '40000', message: 'Invalid identity' }),
							{ status: 400, statusText: 'BadRequest' }
						)
					)
				)
			};
			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.publishCard({} as RawSignedModel, 'valid_jwt'),
				'Invalid identity'
			);
		});
	});

	describe('getCard', () => {
		it ('rejects with custom error on http 401', () => {
			const connectionStub = {
				get: sinon.stub().returns(
					Promise.resolve(
						new Response(
							JSON.stringify({ code: '40100', message: 'Invalid token' }),
							{ status: 401, statusText: 'Unauthorized' }
						)
					)
				),
				post: sinon.stub().throws()
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.getCard('valid_card_id','not_a_valid_jwt'),
				'Invalid token'
			);
		});
	});

	describe('searchCards', () => {
		it ('rejects with custom error on http 401', () => {
			const connectionStub = {
				get: sinon.stub().throws(),
				post: sinon.stub().returns(
					Promise.resolve(
						new Response(
							JSON.stringify({ code: '40100', message: 'Invalid token' }),
							{ status: 401, statusText: 'Unauthorized' }
						)
					)
				)
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.searchCards(['valid_card_identity'],'not_a_valid_jwt'),
				'Invalid token'
			);
		});
	});

	describe('revokeCard', () => {
		it ('rejects with custom error on http 401', () => {
			const connectionStub = {
				post: sinon.stub().returns(
					Promise.resolve(
						new Response(
							JSON.stringify({ code: '40100', message: 'Invalid token' }),
							{ status: 401, statusText: 'Unauthorized' }
						)
					)
				),
				get: sinon.stub().throws()
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.revokeCard('valid_card_id','not_a_valid_jwt'),
				'Invalid token'
			);
		});

		it ('makes request with correct endpoint url and method', async () => {
			const connectionStub = {
				post: sinon.stub().returns(Promise.resolve(new Response(null, { status: 200, statusText: 'OK' }))),
				get: sinon.stub().throws()
			};
			const client = new CardClient(connectionStub as IConnection);

			await client.revokeCard('test_card_id', 'test_jwt');

			assert.isTrue(connectionStub.post.calledOnce);
			assert.equal(connectionStub.post.getCall(0).args[0], '/card/v5/actions/revoke/test_card_id');
			assert.equal(connectionStub.post.getCall(0).args[1], 'test_jwt');
		});

		it ('rejects when card_id is not provided', () => {
			const connectionStub = {
				post: sinon.stub(),
				get: sinon.stub()
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.revokeCard(undefined as any, 'jwt'),
				'`cardId` should not be empty'
			);
		});

		it ('rejects when jwt is not provided', () => {
			const connectionStub = {
				post: sinon.stub(),
				get: sinon.stub()
			};

			const client = new CardClient(connectionStub as IConnection);

			return assert.isRejected(
				client.revokeCard('card_id', undefined as any),
				'`accessToken` should not be empty'
			);
		});
	});
});
