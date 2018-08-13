import { VirgilCrypto } from 'virgil-crypto';
import { CallbackJwtProvider } from '../../Web/Auth/AccessTokenProviders';
import { GetJwtCallback, Jwt } from '../../Web/Auth/Jwt';
import { getUnixTimestamp } from '../../lib/timestamp';

const virgilCrypto = new VirgilCrypto();
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

describe ('CallbackJwtProvider', () => {
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
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
		});

		it ('works with asynchronous callback', () => {
			const expectedJwt = generateJwt();
			const getJwtCallback = sinon.stub().returns(Promise.resolve(expectedJwt));

			const provider = new CallbackJwtProvider(getJwtCallback);

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
		});

		it ('converts string tokens to Jwt instances', () => {
			const expectedJwt = generateJwt();
			const getJwtCallback = sinon.stub().returns(expectedJwt.toString());

			const provider = new CallbackJwtProvider(getJwtCallback);

			return provider.getToken({ operation: 'stub' }).then(actual => {
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
				provider.getToken({ operation: 'stub' }),
				/Wrong JWT/
			);
		});
	});
});
