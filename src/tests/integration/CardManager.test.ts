import { assert } from 'chai';
import { createVirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';
import { CardManager } from '../../Sdk/CardManager';
import { IAccessTokenProvider, ITokenContext } from '../../Sdk/Web/Auth/AccessTokenProviders';
import { ICardVerifier } from '../../Sdk/CardVerifier';
import { ICard } from '../../Sdk/ICard';

const compatData = require('./data.json');
const initCardManager = () => {
	const crypto = createVirgilCrypto();
	const cardCrypto = new VirgilCardCrypto(crypto);

	const accessTokenProviderStub: IAccessTokenProvider = {
		getToken(context: ITokenContext) {
			return Promise.resolve({
				identity: () => 'stub',
				toString: () => 'stub'
			})
		}
	};

	const cardVerifierStub: ICardVerifier = {
		verifyCard(card: ICard) {
			return true;
		}
	};

	return new CardManager({
		cardCrypto,
		retryOnUnauthorized: false,
		accessTokenProvider: accessTokenProviderStub,
		verifier: cardVerifierStub
	});
};

describe('CardManager', () => {

	it('imports and parses card form string (STC-3)', () => {
		const cardManager = initCardManager();
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
		const cardManager = initCardManager();
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




