import { VirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';
import { RawSignedModel, IRawSignedModelJson } from '../../Web/RawSignedModel';
import { parseRawSignedModel } from '../../Utils/CardUtils';

import { compatData } from './data';

const initCardCrypto = () => new VirgilCardCrypto(new VirgilCrypto());

describe('RawSignedModel', () => {

	it('imports raw signed model from string (STC-1)', () => {
		const rawSignedModelString = compatData['STC-1.as_string'];
		const imported = RawSignedModel.fromString(rawSignedModelString);
		assert.isOk(imported, 'imported successfully');
	});

	it('parses imported raw signed model (STC-1)', () => {
		const rawSignedModelString = compatData['STC-1.as_string'];
		const cardCrypto = initCardCrypto();
		const imported = RawSignedModel.fromString(rawSignedModelString);

		const parsed = parseRawSignedModel(cardCrypto, imported);

		assert.isOk(parsed, 'parsed successfully');
		assert.equal(parsed.identity, 'test');
		assert.equal(
			cardCrypto.exportPublicKey(parsed.publicKey as any).toString('base64'),
			'MCowBQYDK2VwAyEA6d9bQQFuEnU8vSmx9fDo0Wxec42JdNg4VR4FOr4/BUk='
		);
		assert.equal(parsed.version, '5.0');
		assert.equal(parsed.createdAt.getTime(), 1515686245 * 1000);
		assert.isNotOk(parsed.previousCardId);
		assert.equal(parsed.signatures.length, 0);
	});

	it('re-exports raw signed model (STC-1)', () => {
		const rawSignedModelString = compatData['STC-1.as_string'];
		const rawSignedModelJson: IRawSignedModelJson = JSON.parse(compatData['STC-1.as_json']);
		const imported = RawSignedModel.fromString(rawSignedModelString);

		const reExported = imported.toJson();

		assert.deepEqual(reExported, rawSignedModelJson);
		assert.isFalse('previous_card_id' in reExported);
	});

	it('imports raw signed model from string (STC-2)', () => {
		const rawSignedModelString = compatData['STC-2.as_string'];
		const imported = RawSignedModel.fromString(rawSignedModelString);
		assert.isOk(imported, 'imported successfully');
	});

	it('parses imported raw signed model (STC-2)', () => {
		const rawSignedModelString = compatData['STC-2.as_string'];
		const cardCrypto = initCardCrypto();
		const imported = RawSignedModel.fromString(rawSignedModelString);

		const parsed = parseRawSignedModel(cardCrypto, imported);

		assert.isOk(parsed, 'parsed successfully');
		assert.equal(parsed.identity, 'test');
		assert.equal(
			cardCrypto.exportPublicKey(parsed.publicKey as any).toString('base64'),
			'MCowBQYDK2VwAyEA6d9bQQFuEnU8vSmx9fDo0Wxec42JdNg4VR4FOr4/BUk='
		);
		assert.equal(parsed.version, '5.0');
		assert.equal(parsed.createdAt.getTime(), 1515686245 * 1000);
		assert.equal(
			parsed.previousCardId,
			'a666318071274adb738af3f67b8c7ec29d954de2cabfd71a942e6ea38e59fff9'
		);
		assert.equal(parsed.signatures.length, 3);
	});

	it('re-exports raw signed model (STC-2)', () => {
		const rawSignedModelString = compatData['STC-2.as_string'];
		const rawSignedModelJson: IRawSignedModelJson = JSON.parse(compatData['STC-2.as_json']);
		const imported = RawSignedModel.fromString(rawSignedModelString);

		const reExported = imported.toJson();

		assert.deepEqual(reExported, rawSignedModelJson);
	});
});
