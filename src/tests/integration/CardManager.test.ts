import { VirgilCrypto, VirgilCardCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import {
	CardManager,
	GeneratorJwtProvider,
	ITokenContext,
	JwtGenerator,
	VirgilCardVerifier
} from '../..';
import { VirgilCardVerificationError } from '../../Web/errors';

import { compatData } from './data';

const init = () => {
	const crypto = new VirgilCrypto();
	const accessTokenSigner = new VirgilAccessTokenSigner(crypto);
	const cardCrypto = new VirgilCardCrypto(crypto);

	const apiPrivateKey = crypto.importPrivateKey(process.env.API_KEY_PRIVATE_KEY!);

	const jwtGenerator = new JwtGenerator({
		appId: process.env.APP_ID!,
		apiKey: apiPrivateKey,
		apiKeyId: process.env.API_KEY_ID!,
		accessTokenSigner,
		millisecondsToLive: 20 * 60 * 1000
	});

	const expiredTokenGenerator = new JwtGenerator({
		appId: process.env.APP_ID!,
		apiKey: apiPrivateKey,
		apiKeyId: process.env.API_KEY_ID!,
		accessTokenSigner,
		millisecondsToLive: 1000
	});

	const accessTokenProvider = new GeneratorJwtProvider(jwtGenerator);

	const cardVerifier = new VirgilCardVerifier(cardCrypto);

	return {
		crypto,
		cardVerifier,
		accessTokenProvider,
		jwtGenerator,
		expiredTokenGenerator,
		cardManager: new CardManager({
			cardCrypto,
			retryOnUnauthorized: false,
			accessTokenProvider: accessTokenProvider,
			cardVerifier: cardVerifier,
			apiUrl: process.env.API_URL
		})
	};
};

const WELL_KNOWN_IDENTITY = `js_sdk_well_known_identity${Date.now()}@virgil.com`;
let WELL_KNOWN_CARD_ID:string;

describe('CardManager', function () {

	this.timeout(10000);

	before(() => {
		const { cardManager, crypto, cardVerifier } = init();
		const keypair = crypto.generateKeys();
		cardVerifier.verifySelfSignature = false;
		cardVerifier.verifyVirgilSignature = false;
		return cardManager.publishCard({
			privateKey: keypair.privateKey,
			publicKey: keypair.publicKey,
			identity: WELL_KNOWN_IDENTITY
		}).then(card => {
			WELL_KNOWN_CARD_ID = card.id;
		});
	});

	describe('card import', () => {
		let cardManager: CardManager;
		beforeEach(() => {
			cardManager = init().cardManager;
			sinon.stub(cardManager.cardVerifier, 'verifyCard').returns(true);
		});

		it('imports and parses card form string (STC-3)', () => {
			const rawSignedModelString = compatData['STC-3.as_string'];
			const rawSignedModelJson = JSON.parse(compatData['STC-3.as_json']);

			const importedFromString = cardManager.importCardFromString(rawSignedModelString);
			const importedFromJson = cardManager.importCardFromJson(rawSignedModelJson);

			assert.deepEqual(importedFromString, importedFromJson, 'imported successfully');
			assert.equal(importedFromJson.id, compatData['STC-3.card_id'], 'id is correct');
			assert.equal(importedFromJson.identity, 'test', 'identity is correct');
			assert.equal(
				cardManager.crypto.exportPublicKey(importedFromJson.publicKey).toString('base64'),
				compatData['STC-3.public_key_base64'],
				'public key is correct'
			);
			assert.equal(importedFromJson.version, '5.0', 'version is correct');
			assert.equal(
				importedFromJson.createdAt.toUTCString(),
				'Thu, 11 Jan 2018 15:57:25 GMT',
				'createdAt is correct'
			);
			assert.notOk(importedFromJson.previousCardId, 'does not have previousCardId');
			assert.notOk(importedFromJson.previousCard, 'does not have previousCard');
			assert.equal(importedFromJson.signatures.length, 0, 'does not have signatures');
		});

		it ('imports and parses card from string (STC-4)', () => {
			const rawSignedModelString = compatData['STC-4.as_string'];
			const rawSignedModelJson = JSON.parse(compatData['STC-4.as_json']);

			const importedFromString = cardManager.importCardFromString(rawSignedModelString);
			const importedFromJson = cardManager.importCardFromJson(rawSignedModelJson);

			assert.deepEqual(importedFromString, importedFromJson, 'imported successfully');
			assert.equal(importedFromJson.id, compatData['STC-4.card_id'], 'id is correct');
			assert.equal(importedFromJson.identity, 'test', 'identity is correct');
			assert.equal(
				cardManager.crypto.exportPublicKey(importedFromJson.publicKey).toString('base64'),
				compatData['STC-4.public_key_base64'],
				'public key is correct'
			);
			assert.equal(importedFromJson.version, '5.0', 'version is correct');
			assert.equal(
				importedFromJson.createdAt.toUTCString(),
				'Thu, 11 Jan 2018 15:57:25 GMT',
				'createdAt is correct'
			);
			assert.notOk(importedFromJson.previousCardId, 'does not have previousCardId');
			assert.notOk(importedFromJson.previousCard, 'does not have previousCard');
			assert.equal(importedFromJson.signatures.length, 3, 'has three signatures');

			const selfSign = importedFromJson.signatures.find(s => s.signer === 'self');
			assert.isOk(selfSign, 'has self signature');
			assert.equal(
				selfSign!.signature.toString('base64'),
				compatData['STC-4.signature_self_base64'],
				'self signature is correct'
			);

			const virgilSign = importedFromJson.signatures.find(s => s.signer === 'virgil');
			assert.isOk(virgilSign, 'has virgil signature');
			assert.equal(
				virgilSign!.signature.toString('base64'),
				compatData['STC-4.signature_virgil_base64'],
				'virgil signature is correct'
			);

			const extraSign = importedFromJson.signatures.find(s => s.signer === 'extra');
			assert.isOk(extraSign, 'has extra signature');
			assert.equal(
				extraSign!.signature.toString('base64'),
				compatData['STC-4.signature_extra_base64'],
				'extra signature is correct'
			);
		});
	});

	describe('card verification (STC-13)', () => {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;
		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			sinon.stub(cardManager.cardVerifier, 'verifyCard').returns(false);
		});

		it ('verifies cards on import from string', () => {
			const rawSignedModelString = compatData['STC-3.as_string'];

			assert.throws(
				() => {
					cardManager.importCardFromString(rawSignedModelString);
				},
				VirgilCardVerificationError
			);
		});

		it ('verifies cards on import from json', () => {
			const rawSignedModelJson = JSON.parse(compatData['STC-3.as_json']);

			assert.throws(
				() => {
					cardManager.importCardFromJson(rawSignedModelJson);
				},
				VirgilCardVerificationError
			);
		});

		it ('verifies cards after publishing', () => {
			const keypair = crypto.generateKeys();

			return assert.isRejected(
				cardManager.publishCard({
					privateKey: keypair.privateKey,
					publicKey: keypair.publicKey,
					identity: `user_${Date.now()}@example.com`
				}),
				VirgilCardVerificationError
			);
		});

		it ('verifies cards after publishing as raw model', () => {
			const keypair = crypto.generateKeys();
			const rawCard = cardManager.generateRawCard({
				privateKey: keypair.privateKey,
				publicKey: keypair.publicKey,
				identity: `user_${Date.now()}@example.com`
			});

			return assert.isRejected(
				cardManager.publishRawCard(rawCard),
				VirgilCardVerificationError
			);
		});

		it ('verifies cards on get', () => {
			return assert.isRejected(
				cardManager.getCard(WELL_KNOWN_CARD_ID),
				VirgilCardVerificationError
			);
		});

		it ('verifies cards on search', () => {
			return assert.isRejected(
				cardManager.searchCards(WELL_KNOWN_IDENTITY),
				VirgilCardVerificationError
			);
		});
	});

	describe('card publishing, and retrieval (STC-17 - STC-18)', () => {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;

		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			fixture.cardVerifier.verifyVirgilSignature = false;
		});

		it ('gets the newly published card by id', () => {
			const keypair = crypto.generateKeys();
			const rawCard = cardManager.generateRawCard({
				privateKey: keypair.privateKey,
				publicKey: keypair.publicKey,
				identity: `user_${Date.now()}@virgil.com`
			});

			return assert.isFulfilled(
				cardManager.publishRawCard(rawCard)
					.then(publishedCard => {
						assert.isTrue(
							publishedCard.contentSnapshot.equals(rawCard.contentSnapshot),
							'snapshot does not change after publishing'
						);
						assert.isFalse(publishedCard.isOutdated, 'published card is up to date');
						return cardManager.getCard(publishedCard.id);
					})
					.then((retrievedCard) => {
						assert.isTrue(
							retrievedCard.contentSnapshot.equals(rawCard.contentSnapshot),
							'snapshot does not change after retrieval'
						);
						assert.isFalse(retrievedCard.isOutdated, 'retrieved card is up to date');
					})
			);
		});

		it ('gets the newly published card with extra data by id', () => {
			const keypair = crypto.generateKeys();
			const cardExtraFields = {
				extraKey: 'extraValue'
			};
			const rawCard = cardManager.generateRawCard({
				privateKey: keypair.privateKey,
				publicKey: keypair.publicKey,
				identity: `user_${Date.now()}@virgil.com`,
				extraFields: cardExtraFields
			});

			return assert.isFulfilled(
				cardManager.publishRawCard(rawCard)
					.then(publishedCard => {
						const selfSignature = publishedCard.signatures.find(s => s.signer === 'self');
						assert.isOk(selfSignature, 'self signature exists');
						assert.deepEqual(selfSignature!.extraFields, cardExtraFields);
						assert.isFalse(publishedCard.isOutdated, 'published card is up to date');

						return cardManager.getCard(publishedCard.id);
					})
					.then((retrievedCard) => {
						const selfSignature = retrievedCard.signatures.find(s => s.signer === 'self');
						assert.isOk(selfSignature, 'self signature exists');
						assert.deepEqual(selfSignature!.extraFields, cardExtraFields);
						assert.isFalse(retrievedCard.isOutdated, 'retrieved card is up to date');
					})
			);
		});
	});

	describe('card rotation (STC-19)', function () {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;

		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			fixture.cardVerifier.verifyVirgilSignature = false;
		});

		it ('rotates cards', () => {
			const sharedIdentity = `user_${Date.now()}@virgil.com`;
			const keypair1 = crypto.generateKeys();

			return assert.eventually.equal(
				// publish card that we will rotate later
				cardManager.publishCard({
					privateKey: keypair1.privateKey,
					publicKey: keypair1.publicKey,
					identity: sharedIdentity
				}).then(publishedCard1 => {
					const keypair2 = crypto.generateKeys();
					// publish second card, replacing the first one
					return cardManager.publishCard({
						privateKey: keypair2.privateKey,
						publicKey: keypair2.publicKey,
						previousCardId: publishedCard1.id,
						identity: sharedIdentity
					})
					.then(() => cardManager.getCard(publishedCard1.id))
					.then(retrievedCard1 => retrievedCard1.isOutdated)
				}),
				true,
				'rotated card is outdated'
			);
		});

		it ('links rotated cards in chains on search', () => {
			const sharedIdentity = `user_${Date.now()}@virgil.com`;
			const keypair1 = crypto.generateKeys();

			return assert.isFulfilled(
				// publish card that we will rotate later
				cardManager.publishCard({
					privateKey: keypair1.privateKey,
					publicKey: keypair1.publicKey,
					identity: sharedIdentity
				}).then(publishedCard1 => {
					const keypair2 = crypto.generateKeys();
					// publish second card, replacing the first one
					return cardManager.publishCard({
						privateKey: keypair2.privateKey,
						publicKey: keypair2.publicKey,
						previousCardId: publishedCard1.id,
						identity: sharedIdentity
					}).then(publishedCard2 => {
						const keypair3 = crypto.generateKeys();
						return cardManager.publishCard({
							privateKey: keypair3.privateKey,
							publicKey: keypair3.publicKey,
							identity: sharedIdentity
						}).then(publishedCard3 => {
							return cardManager.searchCards(sharedIdentity)
								.then(foundCards => {
									assert.equal(foundCards.length, 2);

									const card1 = foundCards.find(card => card.id === publishedCard1.id);
									assert.isNotOk(card1, 'outdated card in not in the result array');

									const card2 = foundCards.find(card => card.id === publishedCard2.id);
									assert.isOk(card2, 'rotated card is in the result array');
									assert.equal(
										card2!.previousCardId,
										publishedCard1.id,
										'rotated card has previous card id'
									);
									assert.isOk(card2!.previousCard, 'rotated card has previous card');
									assert.isTrue(
										card2!.previousCard!.contentSnapshot.equals(publishedCard1.contentSnapshot),
										'rotated card has correct previous card'
									);

									const card3 = foundCards.find(card => card.id === publishedCard3.id);
									assert.isOk(card3, 'third card is in the result array');
								})
						});
					});
				})
			);
		});
	});

	describe('retry on unauthorized', function () {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;

		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;

			cardManager.retryOnUnauthorized = true;

			fixture.cardVerifier.verifyVirgilSignature = false;
			fixture.cardVerifier.verifySelfSignature = false;

			sinon.stub(fixture.accessTokenProvider, 'getToken')
				.callsFake((context: ITokenContext) => {
					if (context.forceReload) {
						// generating good token
						return fixture.jwtGenerator.generateToken(context.identity!);
					} else {
						// generating expired token
						const expiredToken = fixture.expiredTokenGenerator.generateToken(context.identity!);
						const sleep = new Promise(resolve => setTimeout(resolve, 1100));
						// sleeping is needed because minimum token lifetime is 1 second
						return sleep.then(() => expiredToken);
					}
				});
		});

		it ('retries get card', () => {
			return assert.isFulfilled(
				cardManager.getCard(WELL_KNOWN_CARD_ID)
			);
		});

		it ('retries search cards', () => {
			return assert.isFulfilled(
				cardManager.searchCards(WELL_KNOWN_IDENTITY)
			);
		});

		it ('retries publish card', () => {
			const { privateKey, publicKey } = crypto.generateKeys();
			return assert.isFulfilled(
				cardManager.publishCard({
					privateKey,
					publicKey,
					identity: `user_${Date.now()}@virgil.com`
				})
			);
		});
	});
});
