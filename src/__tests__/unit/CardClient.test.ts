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
});
