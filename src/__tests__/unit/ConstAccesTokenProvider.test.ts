import { ConstAccessTokenProvider } from '../../Auth/AccessTokenProviders';

describe ('ConstAccessTokenProvider', () => {
	describe ('constructor', () => {
		it ('throws when accessToken is null or undefined', () => {
			assert.throws(() => {
				new ConstAccessTokenProvider(undefined as any);
			}, TypeError);
		});
	});

	describe ('getToken', () => {
		it ('returns a Promise fulfilled with the access token', () => {
			const expectedAccessToken = { 'stub': 'stub', identity: () => 'stub' };

			const provider = new ConstAccessTokenProvider(expectedAccessToken);

			return assert.eventually.deepEqual(
				provider.getToken({ service: 'stub', operation: 'stub' }),
				expectedAccessToken
			);
		});
	});
});
