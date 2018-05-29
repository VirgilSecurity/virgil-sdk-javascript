import { CallbackJwtProvider, GetJwtCallback } from '../../Sdk/Web/Auth/AccessTokenProviders';
import { Jwt } from '../..';
import { getUnixTimestamp } from '../../Sdk/Lib/timestamp';
import { randomBytes } from 'crypto';

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
		randomBytes(16)
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

			return assert.eventually.deepEqual(
				provider.getToken({ operation: 'stub' }),
				expectedJwt
			);
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
