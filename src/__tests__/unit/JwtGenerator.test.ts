/// <reference path="../declarations.d.ts" />

import { VirgilCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import { JwtGenerator } from '../../Auth/JwtGenerator';
import { JwtContentType, VirgilContentType, IssuerPrefix, SubjectPrefix } from '../../Auth/jwt-constants';
import { getUnixTimestamp } from '../../Lib/timestamp';

const virgilCrypto = new VirgilCrypto();
const accessTokenSigner = new VirgilAccessTokenSigner(virgilCrypto);

describe('JwtGenerator', () => {
	describe('constructor', () => {
		it('throws when options are not provided', () => {
			assert.throws(() => {
				new JwtGenerator(null as any);
			}, 'JwtGenerator options must be provided');
		});

		it('throws when API Key ID is not provided', () => {
			assert.throws(() => {
				new JwtGenerator({
					apiKey: virgilCrypto.generateKeys().privateKey,
					appId: 'irrelevant',
					accessTokenSigner
				} as any);
			}, '`apiKeyId` is required');
		});

		it('throws when API Key is not provided', () => {
			assert.throws(() => {
				new JwtGenerator({
					apiKeyId: 'irrelevant',
					appId: 'irrelevant',
					accessTokenSigner
				} as any);
			}, '`apiKey` is required');
		});

		it('throws when App ID is not provided', () => {
			assert.throws(() => {
				new JwtGenerator({
					apiKey: virgilCrypto.generateKeys().privateKey,
					apiKeyId: 'irrelevant',
					accessTokenSigner
				} as any);
			}, '`appId` is required');
		});

		it('throws when accessTokenSigner is not provided', () => {
			assert.throws(() => {
				new JwtGenerator({
					apiKey: virgilCrypto.generateKeys().privateKey,
					apiKeyId: 'irrelevant',
					appId: 'irrelevant'
				} as any);
			}, '`accessTokenSigner` is required');
		});

		it('uses "millisecondsToLive" value provided in options', () => {
			const expectedMillisecondsToLive = 99999;
			const generator = new JwtGenerator({
				millisecondsToLive: expectedMillisecondsToLive,
				apiKey: virgilCrypto.generateKeys().privateKey,
				apiKeyId: 'irrelevant',
				appId: 'irrelevant',
				accessTokenSigner
			});

			assert.equal(generator.millisecondsToLive, expectedMillisecondsToLive);
		});

		it('uses 20 minutes by default for "millisecondsToLive"', () => {
			const expectedMillisecondsToLive = 20 * 60 * 1000;
			const generator = new JwtGenerator({
				apiKey: virgilCrypto.generateKeys().privateKey,
				apiKeyId: 'irrelevant',
				appId: 'irrelevant',
				accessTokenSigner
			});

			assert.equal(generator.millisecondsToLive, expectedMillisecondsToLive);
		});
	});

	describe('generateToken', () => {
		it('throws when identity is not provided', () => {
			const generator = new JwtGenerator({
				apiKey: virgilCrypto.generateKeys().privateKey,
				apiKeyId: 'irrelevant',
				appId: 'irrelevant',
				accessTokenSigner
			});

			assert.throws(() => {
				generator.generateToken(undefined as any);
			}, '`identity` is required');
		});

		it('generates a valid JWT', () => {
			const keypair = virgilCrypto.generateKeys();
			const generator = new JwtGenerator({
				apiKey: keypair.privateKey,
				apiKeyId: keypair.privateKey.identifier.toString('base64'),
				appId: 'my_app_id',
				accessTokenSigner
			});

			const expectedIdentity = 'test_identity';
			const expectedAda = { additional: 'data' };
			const token = generator.generateToken(expectedIdentity, expectedAda);

			assert.isDefined(token.header, 'JWT has header');
			assert.isDefined(token.body, 'JWT has body');
			assert.isDefined(token.signature, 'JWT has signature');

			assert.equal(token.header.alg, accessTokenSigner.getAlgorithm(), 'algorithm is correct');
			assert.equal(token.header.kid, keypair.privateKey.identifier.toString('base64'), 'key id is correct');
			assert.equal(token.header.typ, JwtContentType, 'token type is correct');
			assert.equal(token.header.cty, VirgilContentType, 'content type is correct');

			assert.equal(token.body.iss, IssuerPrefix + 'my_app_id', 'issuer is correct');
			assert.equal(token.body.sub, SubjectPrefix + 'test_identity', 'subject is correct');
			assert.equal(token.body.iat, getUnixTimestamp(Date.now()), 'issued at is correct');
			assert.equal(
				token.body.exp,
				getUnixTimestamp(Date.now() + generator.millisecondsToLive),
				'expires at is correct'
			);
			assert.deepEqual(token.body.ada, expectedAda, 'additional data is correct');

			assert.isTrue(
				virgilCrypto.verifySignature(token.unsignedData, token.signature!, keypair.publicKey),
				'signature is correct'
			);
		});
	});
});
