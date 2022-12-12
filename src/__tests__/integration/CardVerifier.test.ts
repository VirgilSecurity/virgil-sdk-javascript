/// <reference path="../declarations.d.ts" />

// @ts-nocheck
import { initCrypto, VirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';
import { VirgilCardVerifier, RawSignedModel } from '../..';
import { parseRawSignedModel } from '../../Cards/CardUtils';

import { compatData } from './data';

const init = (cardAsString: string) => {
	const crypto = new VirgilCrypto();
	const cardCrypto = new VirgilCardCrypto(crypto);
	const importedRawSignedModel = RawSignedModel.fromString(cardAsString);
	const importedCard = parseRawSignedModel(cardCrypto, importedRawSignedModel);
	return {
		crypto,
		cardCrypto,
		importedCard,
		verifier: new VirgilCardVerifier(cardCrypto)
	};
};

describe('VirgilCardVerifier', () => {
	before(async () => {
		await initCrypto();
	});

	it ('verifies imported card without checking signatures (STC-10)', () => {
		const { verifier, importedCard } = init(compatData['STC-10.as_string']);

		verifier.verifySelfSignature = false;
		verifier.verifyVirgilSignature = false;

		assert.isTrue(verifier.verifyCard(importedCard));
	});

	it ('verifies imported card checking self signature (STC-10)', () => {
		const { verifier, importedCard } = init(compatData['STC-10.as_string']);

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = false;

		assert.isTrue(verifier.verifyCard(importedCard));
	});

	it ('verifies imported card checking virgil signatures (STC-10)', () => {
		const { verifier, importedCard } = init(compatData['STC-10.as_string']);

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = true;

		assert.isTrue(verifier.verifyCard(importedCard));
	});

	it ('verifies imported card with good key in whitelist (STC-10)', () => {
		const { verifier, importedCard, crypto } = init(compatData['STC-10.as_string']);

		const privateKey1 = crypto.importPrivateKey(compatData['STC-10.private_key1_base64']);
		const publicKey1 = crypto.extractPublicKey(privateKey1);
		const publicKey1Base64 = crypto.exportPublicKey(publicKey1).toString('base64');

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = true;
		verifier.whitelists = [
			[
				{ signer: 'extra', publicKeyBase64: publicKey1Base64}
			]
		];

		assert.isTrue(verifier.verifyCard(importedCard));
	});

	it ('verifies imported card with good and bad key in whitelist (STC-10)', () => {
		const { verifier, importedCard, crypto } = init(compatData['STC-10.as_string']);

		// good key
		const privateKey1 = crypto.importPrivateKey(compatData['STC-10.private_key1_base64']);
		const publicKey1 = crypto.extractPublicKey(privateKey1);
		const publicKey1Base64 = crypto.exportPublicKey(publicKey1).toString('base64');

		// bad key, but irrelevant
		const { publicKey: publicKey2 } = crypto.generateKeys();
		const publicKey2Base64 = crypto.exportPublicKey(publicKey2).toString('base64');

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = true;
		verifier.whitelists = [
			[
				{ signer: 'extra', publicKeyBase64: publicKey2Base64 },
				{ signer: 'extra', publicKeyBase64: publicKey1Base64 }
			]
		];

		assert.isTrue(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card with bad key in whitelist (STC-10)', () => {
		const { verifier, importedCard, crypto } = init(compatData['STC-10.as_string']);

		// good key
		const privateKey1 = crypto.importPrivateKey(compatData['STC-10.private_key1_base64']);
		const publicKey1 = crypto.extractPublicKey(privateKey1);
		const publicKey1Base64 = crypto.exportPublicKey(publicKey1).toString('base64');

		// bad key, but irrelevant
		const { publicKey: publicKey2 } = crypto.generateKeys();
		const publicKey2Base64 = crypto.exportPublicKey(publicKey2).toString('base64');

		// bad key, should fail
		const { publicKey: publicKey3 } = crypto.generateKeys();
		const publicKey3Base64 = crypto.exportPublicKey(publicKey3).toString('base64');

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = true;
		verifier.whitelists = [
			[
				{ signer: 'extra', publicKeyBase64: publicKey2Base64 },
				{ signer: 'extra', publicKeyBase64: publicKey1Base64 }
			],
			[
				{ signer: 'bad', publicKeyBase64: publicKey3Base64 }
			]
		];

		assert.isFalse(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card without self signature (STC-11)', () => {
		const { verifier, importedCard } = init(compatData['STC-11.as_string']);

		verifier.verifyVirgilSignature = false;
		verifier.verifySelfSignature = true;

		assert.isFalse(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card without virgil signature (STC-12)', () => {
		const { verifier, importedCard } = init(compatData['STC-12.as_string']);

		verifier.verifyVirgilSignature = true;
		verifier.verifySelfSignature = false;

		assert.isFalse(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card with invalid virgil signature (STC-14)', () => {
		const { verifier, importedCard } = init(compatData['STC-14.as_string']);

		verifier.verifyVirgilSignature = true;
		verifier.verifySelfSignature = false;

		assert.isFalse(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card with invalid self signature (STC-15)', () => {
		const { verifier, importedCard } = init(compatData['STC-15.as_string']);

		verifier.verifyVirgilSignature = false;
		verifier.verifySelfSignature = true;

		assert.isFalse(verifier.verifyCard(importedCard));
	});

	it ('does not verify imported card with only bad key in whitelist (STC-16)', () => {
		const { verifier, importedCard, crypto } = init(compatData['STC-16.as_string']);

		// bad key, should fail
		const { publicKey } = crypto.generateKeys();
		const publicKeyBase64 = crypto.exportPublicKey(publicKey).toString('base64');

		verifier.verifySelfSignature = true;
		verifier.verifyVirgilSignature = true;
		verifier.whitelists = [
			[
				{ signer: 'extra', publicKeyBase64: publicKeyBase64 }
			]
		];

		assert.isFalse(verifier.verifyCard(importedCard));
	});
});
