import { assert } from 'chai';
import { createVirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtVerifier } from '../../Sdk/Web/Auth/JwtVerifier';
import { JwtGenerator } from '../../Sdk/Web/Auth/JwtGenerator';
import { Jwt } from '../../Sdk/Web/Auth/Jwt';

const compatData = require('./data.json');

const initJwtVerifier = (apiKeyId: string, apiKeyPublicKey: string) => {
	const crypto = createVirgilCrypto();
	return new JwtVerifier({
		accessTokenSigner: new VirgilAccessTokenSigner(crypto),
		apiKeyId: apiKeyId,
		apiPublicKey: crypto.importPublicKey(apiKeyPublicKey)
	});
};

const initJwtGenerator = (appId: string, apiKeyId: string, apiKeyPrivateKey: string) => {
	const crypto = createVirgilCrypto();
	return new JwtGenerator({
		appId: appId,
		apiKeyId: apiKeyId,
		apiKey: crypto.importPrivateKey(apiKeyPrivateKey),
		accessTokenSigner: new VirgilAccessTokenSigner(crypto)
	});
};

describe('JWT compatibility', () => {
	describe('JwtVerifier', () => {
		it('verifies imported JWT (STC-22)', () => {
			const verifier = initJwtVerifier(
				compatData['STC-22.api_key_id'],
				compatData['STC-22.api_public_key_base64']
			);
			const jwtString = compatData['STC-22.jwt'];
			const jwt = Jwt.fromString(jwtString);

			assert.isOk(jwt, 'jwt parsed successfully');
			assert.equal(jwt.identity(), 'some_identity', 'jwt identity is correct');
			assert.equal(
				jwt.appId(),
				'13497c3c795e3a6c32643b0a76957b70d2332080762469cdbec89d6390e6dbd7',
				'jwt app id is correct'
			);
			assert.equal(jwt.toString(), jwtString, 'jwt serialized successfully');
			assert.isTrue(jwt.isExpired(), 'jwt is expired');
			assert.isTrue(verifier.verifyToken(jwt), 'jwt is verified');
		});
	});

	describe('JwtGenerator', () => {
		it('generates valid JWT (STC-23)', () => {
			const verifier = initJwtVerifier(
				compatData['STC-23.api_key_id'],
				compatData['STC-23.api_public_key_base64']
			);
			const generator = initJwtGenerator(
				compatData['STC-23.app_id'],
				compatData['STC-23.api_key_id'],
				compatData['STC-23.api_private_key_base64']
			);

			const jwt = generator.generateToken('user@example.com');
			assert.isOk(jwt, 'jwt generated successfully');
			assert.equal(jwt.identity(), 'user@example.com', 'jwt identity is correct');
			assert.equal(jwt.appId(), compatData['STC-23.app_id'], 'jwt app id is correct');
			assert.isFalse(jwt.isExpired(), 'jwt is not expired');
			assert.isTrue(verifier.verifyToken(jwt), 'jwt is verified');
		});
	});
})
