import { CachingJwtProvider, GetJwtCallback } from '../../Sdk/Web/Auth/AccessTokenProviders';
import { Jwt } from '../..';
import { addSeconds, getUnixTimestamp } from '../../Sdk/Lib/timestamp';
import { randomBytes } from 'crypto';

const generateJwt = (expiresAt: Date) => {
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
		randomBytes(16)
	);
};

describe ('CachingJwtProvider', () => {
	describe ('constructor', () => {
		it ('throws when renewJwtFn is not a function', () => {
			assert.throws(() => {
				new CachingJwtProvider({} as GetJwtCallback);
			}, /must be a function/);
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

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
		});

		it ('rejects if the token string is malformed', () => {
			const getJwtCallback = sinon.stub().returns('no_a_jwt');

			const provider = new CachingJwtProvider(getJwtCallback);

			return assert.isRejected(
				provider.getToken({ operation: 'stub' }),
				/Wrong JWT/
			);
		});
	});
});
