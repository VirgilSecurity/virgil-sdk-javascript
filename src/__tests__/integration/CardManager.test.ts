/// <reference path="../declarations.d.ts" />

import { initCrypto, VirgilCrypto, VirgilCardCrypto, VirgilAccessTokenSigner } from 'virgil-crypto';
import {
	CardManager,
	GeneratorJwtProvider,
	ITokenContext,
	JwtGenerator,
	VirgilCardVerifier,
} from '../..';
import { VirgilCardVerificationError } from '../../Cards/errors';
import { ICard } from '../../Cards/ICard';
import * as chaiAsPromised from "chai-as-promised";
import { compatData } from './data';
import { use } from "chai";
// @ts-ignore
import {
	assert,
	sinon
} from '../declarations';

const WELL_KNOWN_IDENTITY = `js_sdk_well_known_identity${Date.now()}@virgil.com`;
let WELL_KNOWN_CARD_ID:string;

const init = (identity: string = WELL_KNOWN_IDENTITY) => {
	const crypto = new VirgilCrypto();
	const accessTokenSigner = new VirgilAccessTokenSigner(crypto);
	const cardCrypto = new VirgilCardCrypto(crypto);

	const apiPrivateKey = crypto.importPrivateKey(process.env.APP_KEY!);

	const jwtGenerator = new JwtGenerator({
		appId: process.env.APP_ID!,
		apiKey: apiPrivateKey,
		apiKeyId: process.env.APP_KEY_ID!,
		accessTokenSigner,
		millisecondsToLive: 20 * 60 * 1000
	});

	const expiredTokenGenerator = new JwtGenerator({
		appId: process.env.APP_ID!,
		apiKey: apiPrivateKey,
		apiKeyId: process.env.APP_KEY_ID!,
		accessTokenSigner,
		millisecondsToLive: 1000
	});

	const accessTokenProvider = new GeneratorJwtProvider(jwtGenerator, undefined, identity);

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

describe('CardManager', async function () {

	//this.timeout(10000);
	await initCrypto();

	before( () => {
		use(chaiAsPromised)
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

			assert.equal(importedFromJson.id, compatData['STC-3.card_id'], 'id is correct');
			assert.equal(importedFromJson.identity, 'test', 'identity is correct');
			assert.equal(
				Buffer.from(cardManager.crypto.exportPublicKey(importedFromJson.publicKey)).toString('base64'),
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

			assert.equal(importedFromJson.id, compatData['STC-4.card_id'], 'id is correct');
			assert.equal(importedFromJson.identity, 'test', 'identity is correct');
			assert.equal(
				Buffer.from(cardManager.crypto.exportPublicKey(importedFromJson.publicKey)).toString('base64'),
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
				selfSign!.signature,
				compatData['STC-4.signature_self_base64'],
				'self signature is correct'
			);

			const virgilSign = importedFromJson.signatures.find(s => s.signer === 'virgil');
			assert.isOk(virgilSign, 'has virgil signature');
			assert.equal(
				virgilSign!.signature,
				compatData['STC-4.signature_virgil_base64'],
				'virgil signature is correct'
			);

			const extraSign = importedFromJson.signatures.find(s => s.signer === 'extra');
			assert.isOk(extraSign, 'has extra signature');
			assert.equal(
				extraSign!.signature,
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

		it ('verifies cards after publishing', async() => {
			const keypair = crypto.generateKeys();

			return await assert.isRejected(
				cardManager.publishCard({
					privateKey: keypair.privateKey,
					publicKey: keypair.publicKey,
					identity: `user_${Date.now()}@example.com`
				}),
				VirgilCardVerificationError
			);
		});

		it ('verifies cards after publishing as raw model', async () => {
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

		it ('verifies cards on get', async () => {
			return assert.isRejected(
				cardManager.getCard(WELL_KNOWN_CARD_ID),
				VirgilCardVerificationError
			);
		});

		it ('verifies cards on search', async () => {
			return assert.isRejected(
				cardManager.searchCards(WELL_KNOWN_IDENTITY),
				VirgilCardVerificationError
			);
		});
	});

	describe('card publishing, and retrieval (STC-17 - STC-18)', () => {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;

		const generateRawCard = (identity: string) => {
			const { privateKey, publicKey } = crypto.generateKeys();

			return cardManager.generateRawCard({
				privateKey,
				publicKey,
				identity,
			});
		}

		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			fixture.cardVerifier.verifyVirgilSignature = false;
		});

		it ('gets the newly published card by id', async () => {
			const keypair = crypto.generateKeys();
			const rawCard = cardManager.generateRawCard({
				privateKey: keypair.privateKey,
				publicKey: keypair.publicKey,
				identity: `user_${Date.now()}@virgil.com`
			});

			const publishedCard = await cardManager.publishRawCard(rawCard);
			assert.equal(
				publishedCard.contentSnapshot,
				rawCard.contentSnapshot,
				'snapshot does not change after publishing'
			);
			assert.isFalse(publishedCard.isOutdated, 'published card is up to date');

			const retrievedCard = await cardManager.getCard(publishedCard.id);
			assert.equal(
				retrievedCard.contentSnapshot,
				rawCard.contentSnapshot,
				'snapshot does not change after retrieval'
			);
			assert.isFalse(retrievedCard.isOutdated, 'retrieved card is up to date');
		});

		it ('gets the newly published card with extra data by id', async () => {
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

			const publishedCard = await cardManager.publishRawCard(rawCard);
			const selfSignature1 = publishedCard.signatures.find(s => s.signer === 'self');
			assert.isOk(selfSignature1, 'self signature exists');
			assert.deepEqual(selfSignature1!.extraFields, cardExtraFields);
			assert.isFalse(publishedCard.isOutdated, 'published card is up to date');

			const retrievedCard = await cardManager.getCard(publishedCard.id);
			const selfSignature2 = retrievedCard.signatures.find(s => s.signer === 'self');
			assert.isOk(selfSignature2, 'self signature exists');
			assert.deepEqual(selfSignature2!.extraFields, cardExtraFields);
			assert.isFalse(retrievedCard.isOutdated, 'retrieved card is up to date');
		});

		it ('finds the newly published card by id', async () => {
			const keypair = crypto.generateKeys();
			const rawCard = cardManager.generateRawCard({
				privateKey: keypair.privateKey,
				publicKey: keypair.publicKey,
				identity: `user_${Date.now()}@virgil.com`
			});

			const publishedCard = await cardManager.publishRawCard(rawCard);
			const foundCards = await cardManager.searchCards(publishedCard.identity);
			assert.equal(foundCards.length, 1);
			assert.equal(foundCards[0].id, publishedCard.id);
		});

		it ('searches by multiple identities', async () => {
			const rawCard1 = generateRawCard(`user1_${Date.now()}@virgil.com`)
			const rawCard2 = generateRawCard(`user2_${Date.now()}@virgil.com`);

			const [publishedCard1, publishedCard2] = await Promise.all([
				cardManager.publishRawCard(rawCard1),
				cardManager.publishRawCard(rawCard2)
			]);
			const foundCards = await cardManager.searchCards([
				publishedCard1.identity,
				publishedCard2.identity
			]);

			assert.equal(foundCards.length, 2);
			assert.isTrue(foundCards.some(foundCard => foundCard.id === publishedCard1.id));
			assert.isTrue(foundCards.some(foundCard => foundCard.id === publishedCard2.id));
		});
	});

	describe('card rotation (STC-19)', function () {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;

		const publishCard = (identity: string) => {
			const { privateKey, publicKey } = crypto.generateKeys();

			return cardManager.publishCard({
				privateKey,
				publicKey,
				identity,
			});
		}

		const rotateCard = (previousCard: ICard) => {
			const { privateKey, publicKey } = crypto.generateKeys();
			return cardManager.publishCard({
				privateKey,
				publicKey,
				identity: previousCard.identity,
				// setting previousCardId will mark the previous card as outdated
				previousCardId: previousCard.id
			});
		}

		beforeEach(() => {
			const fixture = init();
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			fixture.cardVerifier.verifyVirgilSignature = false;
		});

		it ('rotates cards', async () => {
			const sharedIdentity = `user_${Date.now()}@virgil.com`;

			const oldCard = await publishCard(sharedIdentity);
			const _newCard = await rotateCard(oldCard);

			const retrievedCard = await cardManager.getCard(oldCard.id)
			assert.isTrue(retrievedCard.isOutdated, 'rotated card is outdated');
		});

		it ('links rotated cards in chains on search', async () => {
			const sharedIdentity = `user_${Date.now()}@virgil.com`;

			// publish card that we will rotate later
			const publishedCard1 = await publishCard(sharedIdentity);

			// replace the first one
			const publishedCard2 = await rotateCard(publishedCard1);

			// publish anoter one with the same identity
			const publishedCard3 = await publishCard(sharedIdentity);

			const foundCards = await cardManager.searchCards(sharedIdentity)
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
			assert.equal(
				card2!.previousCard!.contentSnapshot,
				publishedCard1.contentSnapshot,
				'rotated card has correct previous card'
			);

			const card3 = foundCards.find(card => card.id === publishedCard3.id);
			assert.isOk(card3, 'third card is in the result array');
		});

		it ('links cards in multiple chains on search', async () => {
			const sharedIdentity1 = `user1_${Date.now()}@virgil.com`;
			const sharedIdentity2 = `user2_${Date.now()}@virgil.com`;

			const oldCard1 = await publishCard(sharedIdentity1);
			const newCard1 = await rotateCard(oldCard1);

			const oldCard2 = await publishCard(sharedIdentity2);
			const newCard2 = await rotateCard(oldCard2);

			const foundCards = await cardManager.searchCards([sharedIdentity1, sharedIdentity2]);

			assert.isFalse(
				foundCards.some(foundCard => foundCard.id === oldCard1.id || foundCard.id === oldCard2.id)
			);

			const foundCard1 = foundCards.find(card => card.id === newCard1.id);
			assert.isOk(foundCard1);
			assert.equal(foundCard1!.previousCardId, oldCard1.id);

			const foundCard2 = foundCards.find(card => card.id === newCard2.id);
			assert.isOk(foundCard2);
			assert.equal(foundCard2!.previousCardId, oldCard2.id);
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

			const getTokenFn = (context: ITokenContext) => {
				if (context.forceReload) {
					// generating good token
					return Promise.resolve(fixture.jwtGenerator.generateToken(WELL_KNOWN_IDENTITY));
				} else {
					// generating expired token
					const expiredToken = fixture.expiredTokenGenerator.generateToken(WELL_KNOWN_IDENTITY);
					const sleep = new Promise(resolve => setTimeout(resolve, 2000));
					// sleeping is needed because minimum token lifetime is 1 second
					return sleep.then(() => expiredToken);
				}
			};

			sinon.stub(fixture.accessTokenProvider, 'getToken')
				.callsFake(getTokenFn as any);
		});

		it ('retries get card', async () => {
			return assert.isFulfilled(
				cardManager.getCard(WELL_KNOWN_CARD_ID)
			);
		});

		it ('retries search cards', async () => {
			return assert.isFulfilled(
				cardManager.searchCards(WELL_KNOWN_IDENTITY)
			);
		});

		it ('retries publish card', async () => {
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

	describe('card revocation', function () {
		let cardManager: CardManager;
		let crypto: VirgilCrypto;
		let currentIdentity: string;

		const publishCard = (identity: string) => {
			const { privateKey, publicKey } = crypto.generateKeys();

			return cardManager.publishCard({
				privateKey,
				publicKey,
				identity,
			});
		}

		beforeEach(() => {
			currentIdentity = `deleted_user_${Date.now()}@virgil.com`;
			const fixture = init(currentIdentity);
			cardManager = fixture.cardManager;
			crypto = fixture.crypto;
			fixture.cardVerifier.verifyVirgilSignature = false;
		});

		it('can revoke card', async () => {
			const card = await publishCard(currentIdentity);

			const result = await cardManager.revokeCard(card.id);

			assert.isUndefined(result);
		});

		it('marks revoked card as outdated', async () => {
			const card = await publishCard(currentIdentity);
			await cardManager.revokeCard(card.id);

			const revokedCard = await cardManager.getCard(card.id);

			assert.isOk(revokedCard);
			assert.isTrue(revokedCard.isOutdated);
		});

		it('does not include revoked card in search results', async () => {
			const card = await publishCard(currentIdentity);
			await cardManager.revokeCard(card.id);

			const searchResult = await cardManager.searchCards(currentIdentity);
			assert.equal(searchResult.length, 0);
		});
	});
});
