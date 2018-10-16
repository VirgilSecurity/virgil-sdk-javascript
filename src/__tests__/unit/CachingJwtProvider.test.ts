import { VirgilCrypto } from 'virgil-crypto';
import { addSeconds, getUnixTimestamp } from '../../Lib/timestamp';
import { GetJwtCallback, Jwt } from '../../Auth/Jwt';
import { CachingJwtProvider } from '../../Auth/AccessTokenProviders';

const virgilCrypto = new VirgilCrypto();
const generateJwt = (expiresAt: Date): Jwt => {
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
			exp: getUnixTimestamp(expiresAt)
		},
		virgilCrypto.getRandomBytes(16).toString('base64')
	);
};

describe ('CachingJwtProvider', () => {
	describe ('constructor', () => {
		it ('throws when renewJwtFn is not a function', () => {
			assert.throws(() => {
				new CachingJwtProvider({} as GetJwtCallback);
			}, /must be a function/);
		});

		it ('accepts initial token value as Jwt instance', () => {
			const initialJwt = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().rejects('should have used initial token');

			const provider = new CachingJwtProvider(getJwtCallback, initialJwt);

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				initialJwt
			);
		});

		it ('accepts initial token value as stirng', () => {
			const initialJwt = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().rejects('should have used inital token');

			const provider = new CachingJwtProvider(getJwtCallback, initialJwt.toString());

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				initialJwt
			);
		});

		it ('throws when initial token string is malformed', () => {
			const initialJwt = 'not_a_jwt';
			const getJwtCallback = sinon.stub();

			assert.throws(() => {
				new CachingJwtProvider(getJwtCallback, initialJwt);
			}, /Wrong JWT/);
		});

		it ('throws Error when initialToken is neither a Jwt nor a string', () => {
			const initialJwt = 1;
			const getJwtCallback = sinon.stub();

			assert.throws(() => {
				new CachingJwtProvider(getJwtCallback, initialJwt as any);
			}, 'Expected "initialToken" to be a string or an instance of Jwt, got number');
		});
	});

	describe ('getToken', () => {
		it ('works with synchronous callback', () => {
			const expectedJwt = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().returns(expectedJwt);

			const provider = new CachingJwtProvider(getJwtCallback);

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
		});

		it ('works with asynchronous callback', () => {
			const expectedJwt = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().returns(Promise.resolve(expectedJwt));

			const provider = new CachingJwtProvider(getJwtCallback);

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
		});

		it ('caches the token for subsequent calls', () => {
			const getJwtCallback = sinon.stub().returns(generateJwt(addSeconds(new Date, 60)));

			const provider = new CachingJwtProvider(getJwtCallback);
			return assert.eventually.equal(
				Promise.all(
					new Array(10).fill(0).map(() =>
						provider.getToken({ operation: 'stub' })
					)
				).then(() => getJwtCallback.callCount),
				1,
				'the user-provided callback is called only once'
			);
		});

		it ('gets new token when the cached one expires', () => {
			const getJwtCallback = sinon.stub();
			// token that has less than 5 seconds left to live should be considered expired
			const expiredToken = generateJwt(addSeconds(new Date, 1));
			const freshToken = generateJwt(addSeconds(new Date, 60));
			getJwtCallback.onCall(0).returns(expiredToken);
			getJwtCallback.onCall(1).returns(freshToken);

			const provider = new CachingJwtProvider(getJwtCallback);

			return assert.eventually.equal(
				provider.getToken({ operation: 'stub' })
					.then(() => provider.getToken({ operation: 'stub' }))
					.then(() => getJwtCallback.callCount),
				2,
				'the user-provided callback is called twice'
			);
		});

		it ('converts string tokens to Jwt instances', () => {
			const expectedJwt = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().returns(expectedJwt.toString());

			const provider = new CachingJwtProvider(getJwtCallback);

			return provider.getToken({ operation: 'stub' }).then(actual => {
				const actualJwt = actual as Jwt;
				assert.deepEqual(actualJwt.header, expectedJwt.header);
				assert.deepEqual(actualJwt.body, expectedJwt.body);
				assert.equal(actualJwt.signature, expectedJwt.signature);
			});
		});

		it ('rejects if the token string is malformed', () => {
			const getJwtCallback = sinon.stub().returns('no_a_jwt');

			const provider = new CachingJwtProvider(getJwtCallback);

			return assert.isRejected(
				provider.getToken({ operation: 'stub' }),
				/Wrong JWT/
			);
		});

		it ('gets new token when inital token expires', () => {
			const expiredInitialToken = generateJwt(addSeconds(new Date, 1));
			const freshToken = generateJwt(addSeconds(new Date, 60));
			const getJwtCallback = sinon.stub().resolves(freshToken);

			const provider = new CachingJwtProvider(getJwtCallback, expiredInitialToken);

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				freshToken,
				'returns fresh token'
			);
		});
	});
});
