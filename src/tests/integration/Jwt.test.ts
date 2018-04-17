import { createVirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtVerifier } from '../../Sdk/Web/Auth/JwtVerifier';
import { JwtGenerator } from '../../Sdk/Web/Auth/JwtGenerator';
import { Jwt } from '../../Sdk/Web/Auth/Jwt';
import { CallbackJwtProvider, ITokenContext } from '../../Sdk/Web/Auth/AccessTokenProviders';
import { ConstAccessTokenProvider } from '../../Sdk/Web/Auth/AccessTokenProviders';

import { compatData } from './data';

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

	describe('CallbackJwtProvider', () => {
		it ('invokes callback correctly', () => {
			const generator = initJwtGenerator(
				compatData['STC-23.app_id'],
				compatData['STC-23.api_key_id'],
				compatData['STC-23.api_private_key_base64']
			);
			const jwt = generator.generateToken('irrelevant');
			const callback = sinon.stub().returns(Promise.resolve(jwt.toString()));
			const provider = new CallbackJwtProvider(callback);
			const tokenContext: ITokenContext = { identity: 'irrelevant', operation: 'irrelevant' };

			return assert.isFulfilled(
				provider.getToken(tokenContext)
					.then(token => {
						assert.equal(token.toString(), jwt.toString(), 'token is unmodified');
						assert.calledOnce(callback);
						assert.calledWithExactly(callback, tokenContext);
					})
			);
		});

		it ('rejects when receives invalid token from callback (STC-24)', () => {
			const callback = sinon.stub().returns(Promise.resolve('invalid-token'));
			const provider = new CallbackJwtProvider(callback);
			const tokenContext: ITokenContext = { identity: 'irrelevant', operation: 'irrelevant' };


			return assert.isRejected(
				provider.getToken(tokenContext),
				/Wrong JWT/
			);
		});
	});

	describe('ConstJwtProvider', () => {
		it ('returns the constant token (STC-37)', () => {
			const generator = initJwtGenerator(
				compatData['STC-23.app_id'],
				compatData['STC-23.api_key_id'],
				compatData['STC-23.api_private_key_base64']
			);
			const jwt = generator.generateToken('irrelevant');
			const provider = new ConstAccessTokenProvider(jwt);
			const tokenContext: ITokenContext = { identity: 'irrelevant', operation: 'irrelevant' };

			return assert.isFulfilled(
				provider.getToken(tokenContext)
					.then(token => {
						assert.equal(token, jwt);
					})
			);
		});
	});

	describe('Jwt', () => {
		it ('can be constructed from string (STC-28)', () => {
			const tokenString = compatData['STC-28.jwt'];
			const jwt = Jwt.fromString(tokenString);

			assert.equal(jwt.identity(), compatData['STC-28.jwt_identity'], 'identity is correct');
			assert.equal(jwt.appId(), compatData['STC-28.jwt_app_id'], 'app id is correct');
			assert.equal(jwt.body.iss, compatData['STC-28.jw_issuer'], 'issuer is correct');
			assert.equal(jwt.body.sub, compatData['STC-28.jwt_subject'], 'subject is correct');
			assert.deepEqual(
				jwt.body.ada,
				JSON.parse(compatData['STC-28.jwt_additional_data']),
				'additional data is correct'
			);
			assert.equal(jwt.body.exp, Number(compatData['STC-28.jwt_expires_at']), 'expiresAt is correct');
			assert.equal(jwt.body.iat, Number(compatData['STC-28.jwt_issued_at']), 'issuedAt is correct');
			assert.equal(jwt.header.alg, compatData['STC-28.jwt_algorithm'], 'algorithm is correct');
			assert.equal(jwt.header.kid, compatData['STC-28.jwt_api_key_id'], 'key id is correct');
			assert.equal(jwt.header.cty, compatData['STC-28.jwt_content_type'], 'content type is correct');
			assert.equal(jwt.header.typ, compatData['STC-28.jwt_type'], 'type is correct');
			assert.equal(
				jwt.signature!.toString('base64'),
				compatData['STC-28.jwt_signature_base64'],
				'type is correct'
			);
			assert.isTrue(jwt.isExpired(), 'jwt is expired');
			assert.equal(jwt.toString(), tokenString, 'string representation is correct');
		});

		it ('can be constructed from string (STC-29)', () => {
			const tokenString = compatData['STC-29.jwt'];
			const jwt = Jwt.fromString(tokenString);

			assert.equal(jwt.identity(), compatData['STC-29.jwt_identity'], 'identity is correct');
			assert.equal(jwt.appId(), compatData['STC-29.jwt_app_id'], 'app id is correct');
			assert.equal(jwt.body.iss, compatData['STC-29.jw_issuer'], 'issuer is correct');
			assert.equal(jwt.body.sub, compatData['STC-29.jwt_subject'], 'subject is correct');
			assert.deepEqual(
				jwt.body.ada,
				JSON.parse(compatData['STC-29.jwt_additional_data']),
				'additional data is correct'
			);
			assert.equal(jwt.body.exp, Number(compatData['STC-29.jwt_expires_at']), 'expiresAt is correct');
			assert.equal(jwt.body.iat, Number(compatData['STC-29.jwt_issued_at']), 'issuedAt is correct');
			assert.equal(jwt.header.alg, compatData['STC-29.jwt_algorithm'], 'algorithm is correct');
			assert.equal(jwt.header.kid, compatData['STC-29.jwt_api_key_id'], 'key id is correct');
			assert.equal(jwt.header.cty, compatData['STC-29.jwt_content_type'], 'content type is correct');
			assert.equal(jwt.header.typ, compatData['STC-29.jwt_type'], 'type is correct');
			assert.equal(
				jwt.signature!.toString('base64'),
				compatData['STC-29.jwt_signature_base64'],
				'type is correct'
			);
			assert.isFalse(jwt.isExpired(), 'jwt is not expired');
			assert.equal(jwt.toString(), tokenString, 'string representation is correct');
		});
	});
});
