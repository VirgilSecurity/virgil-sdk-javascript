import { initCrypto, VirgilCrypto } from 'virgil-crypto';
import { CallbackJwtProvider } from '../../Auth/AccessTokenProviders';
import { GetJwtCallback, Jwt } from '../../Auth/Jwt';
import { getUnixTimestamp } from '../../Lib/timestamp';

describe ('CallbackJwtProvider', () => {
	let virgilCrypto: VirgilCrypto;

	before(async () => {
		await initCrypto();
		virgilCrypto = new VirgilCrypto();
	});

	const generateJwt = () => {
		return new Jwt(
			{
				alg: 'stub',
				typ: 'stub',
				cty: 'stub',
				kid: 'stub'
			},
			{
				iss: 'stub',
				sub: 'stub',
				iat: getUnixTimestamp(new Date),
				exp: getUnixTimestamp(new Date(Date.now() + 10000))
			},
			virgilCrypto.getRandomBytes(16).toString('base64')
		);
	};

	describe ('constructor', () => {
		it ('throws when getJwtFn is not a function', () => {
			assert.throws(() => {
				new CallbackJwtProvider({} as GetJwtCallback);
			}, /must be a function/);
		});
	});

	describe ('getToken', () => {
		it ('works with synchronous callback', () => {
			const expectedJwt = generateJwt();
			const getJwtCallback = sinon.stub().returns(expectedJwt);

			const provider = new CallbackJwtProvider(getJwtCallback);

			return assert.eventually.deepEqual(
				provider.getToken({ service: 'stub', operation: 'stub' }),
				expectedJwt
			);
		});

		it ('works with asynchronous callback', () => {
			const expectedJwt = generateJwt();
			const getJwtCallback = sinon.stub().returns(Promise.resolve(expectedJwt));

			const provider = new CallbackJwtProvider(getJwtCallback);

			return assert.eventually.deepEqual(
				provider.getToken({ service: 'stub', operation: 'stub' }),
				expectedJwt
			);
		});

		it ('converts string tokens to Jwt instances', () => {
			const expectedJwt = generateJwt();
			const getJwtCallback = sinon.stub().returns(expectedJwt.toString());

			const provider = new CallbackJwtProvider(getJwtCallback);

			return provider.getToken({ service: 'stub', operation: 'stub' }).then(actual => {
				const actualJwt = actual as Jwt;
				assert.deepEqual(actualJwt.header, expectedJwt.header);
				assert.deepEqual(actualJwt.body, expectedJwt.body);
				assert.equal(actualJwt.signature, expectedJwt.signature);
			});
		});

		it ('rejects if the token string is malformed', () => {
			const getJwtCallback = sinon.stub().returns('no_a_jwt');

			const provider = new CallbackJwtProvider(getJwtCallback);

			return assert.isRejected(
				provider.getToken({ service: 'stub', operation: 'stub' }),
				/Wrong JWT/
			);
		});
	});
});
