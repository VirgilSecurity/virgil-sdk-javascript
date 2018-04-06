import { JwtGenerator, JwtVerifier, Jwt } from '..';
import { assert } from 'chai';
import { createVirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';

describe('Jwt compatibility', () => {
	describe('JwtVerifier', () => {
		it('should verify pre-generated token', () => {
			const crypto = createVirgilCrypto();
			const accessTokenSigner = new VirgilAccessTokenSigner(crypto);

			const apiPublicKeyBase64 = 'MCowBQYDK2VwAyEAY9J8et78SmmE4GOm7f8fdew/eQB5YxKkwZeO3Z1IBt4=';
			const apiKeyId = '8e62643674d100b8a52648475c23b8bb86a1f119e89970cc63cdccc0920df2ea' +
				'2d8cb7d6b54c4a9e284b2ccf5acb22ea37efefcb6e4274c4b04ed725e4454ca1';
			const jwtString = 'eyJhbGciOiJWRURTNTEyIiwiY3R5IjoidmlyZ2lsLWp3dDt2PTEiLCJraWQiOiI4ZT' +
				'YyNjQzNjc0ZDEwMGI4YTUyNjQ4NDc1YzIzYjhiYjg2YTFmMTE5ZTg5OTcwY2M2M2NkY2NjMDkyMGRmMm' +
				'VhMmQ4Y2I3ZDZiNTRjNGE5ZTI4NGIyY2NmNWFjYjIyZWEzN2VmZWZjYjZlNDI3NGM0YjA0ZWQ3MjVlND' +
				'Q1NGNhMSIsInR5cCI6IkpXVCJ9.eyJhZGEiOnsidXNlcm5hbWUiOiJzb21lX3VzZXJuYW1lIn0sImV4c' +
				'CI6MTUxODUxMzkwOSwiaWF0IjoxNTE4NTEzMzA5LCJpc3MiOiJ2aXJnaWwtMTM0OTdjM2M3OTVlM2E2Y' +
				'zMyNjQzYjBhNzY5NTdiNzBkMjMzMjA4MDc2MjQ2OWNkYmVjODlkNjM5MGU2ZGJkNyIsInN1YiI6ImlkZ' +
				'W50aXR5LXNvbWVfaWRlbnRpdHkifQ.MFEwDQYJYIZIAWUDBAIDBQAEQDMCvFjAaCBE5oLbFY9CAC-HPi' +
				'PkBVr3qSZChbwRaRZADb6RZuljSpEvzoiqNGTxgUgqUiCefH-Tkb89tvjSdAY';

			const apiPublicKey = crypto.importPublicKey(apiPublicKeyBase64);

			const jwtVerifier = new JwtVerifier({
				accessTokenSigner,
				apiPublicKey,
				apiKeyId
			});

			const jwt = Jwt.fromString(jwtString);

			assert.exists(jwt.identity(), 'identity exists');
			assert.exists(jwt.appId(), 'application id exists');
			assert.isTrue(jwt.isExpired(), 'jwt is expired');
			assert.isTrue(jwtVerifier.verifyToken(jwt), 'jwt is valid');
		});
	});

	describe('JwtGenerator', () => {
		it('should generate tokens', () => {
			const crypto = createVirgilCrypto();
			const accessTokenSigner = new VirgilAccessTokenSigner(crypto);

			const apiPrivateKeyBase64 = 'MC4CAQAwBQYDK2VwBCIEIMxSaUI1QizmMvSPyTc26YsK21clGXKEztNKZ7NtrATP';
			const apiPublicKeyBase64 = 'MCowBQYDK2VwAyEAY9J8et78SmmE4GOm7f8fdew/eQB5YxKkwZeO3Z1IBt4=';
			const apiKeyId = '8e62643674d100b8a52648475c23b8bb86a1f119e89970cc63cdccc0920df2ea' +
				'2d8cb7d6b54c4a9e284b2ccf5acb22ea37efefcb6e4274c4b04ed725e4454ca1';
			const appId = '13497c3c795e3a6c32643b0a76957b70d2332080762469cdbec89d6390e6dbd7';

			const apiPrivateKey = crypto.importPrivateKey(apiPrivateKeyBase64);
			const apiPublicKey = crypto.importPublicKey(apiPublicKeyBase64);

			const jwtVerifier = new JwtVerifier({
				accessTokenSigner,
				apiPublicKey,
				apiKeyId
			});

			const jwtGenerator = new JwtGenerator({
				appId,
				apiKey: apiPrivateKey,
				apiKeyId,
				accessTokenSigner,
				millisecondsToLive: 20 * 60 * 1000
			});

			const jwt = jwtGenerator.generateToken('user@example.com');

			assert.equal(jwt.identity(), 'user@example.com', 'identity is correct');
			assert.equal(jwt.appId(), appId, 'application id is correct');
			assert.isFalse(jwt.isExpired(), 'jwt is not expired');
			assert.isTrue(jwtVerifier.verifyToken(jwt), 'jwt is verified');
		});
	});
});
