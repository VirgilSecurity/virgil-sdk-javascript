// @ts-nocheck
import { GeneratorJwtProvider } from '../../Auth/AccessTokenProviders';

describe ('GeneratorJwtProvider', () => {
	describe ('constructor', () => {
		it ('throws when jwtGenerator is null or undefined', () => {
			assert.throws(() => {
				new GeneratorJwtProvider(undefined as any);
			}, TypeError);
		});
	});

	describe ('getToken', () => {
		it ('delegates to generator', () => {
			const expectedAccessToken = { 'stub': 'stub' };
			const generatorStub = {
				generateToken: sinon.stub().returns(expectedAccessToken)
			};

			const provider = new GeneratorJwtProvider(generatorStub as any);

			assert.eventually.deepEqual(
				provider.getToken({ service: 'stub', operation: 'stub' }),
				expectedAccessToken
			);
		});

		it ('passes identity from context to generator', () => {
			const generatorStub = {
				generateToken: sinon.stub()
			};

			const provider = new GeneratorJwtProvider(generatorStub as any);

			assert.isFulfilled(
				provider.getToken({ service: 'stub', operation: 'stub', identity: 'fake_identity' })
					.then(() => assert.calledWith(generatorStub.generateToken, 'fake_identity'))
			);
		});

		it ('passes defaultIdentity to generator if none is provided in the context', () => {
			const generatorStub = {
				generateToken: sinon.stub()
			};

			const provider = new GeneratorJwtProvider(
				generatorStub as any,
				undefined,
				'fake_default_identity'
			);

			assert.isFulfilled(
				provider.getToken({ service: 'stub', operation: 'stub' })
					.then(() => assert.calledWith(generatorStub.generateToken, 'fake_default_identity'))
			);
		});

		it ('passes empty string as identity to generator if none is provided', () => {
			const generatorStub = {
				generateToken: sinon.stub()
			};

			const provider = new GeneratorJwtProvider(generatorStub as any); // no defaultIdentity

			assert.isFulfilled(
				provider.getToken({ service: 'stub', operation: 'stub' }) // no context identity
					.then(() => assert.calledWith(generatorStub.generateToken, ''))
			);
		});

		it ('passes additional data to generator', () => {
			const generatorStub = {
				generateToken: sinon.stub()
			};

			const provider = new GeneratorJwtProvider(generatorStub as any, { additional: 'data' });

			assert.isFulfilled(
				provider.getToken({ service: 'stub', operation: 'stub', identity: 'fake_identity' })
					.then(() => assert.calledWith(
							generatorStub.generateToken,
							'fake_identity',
							{ additional: 'data' }
						)
					)
			);
		});
	});
});
