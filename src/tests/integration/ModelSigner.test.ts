import { createVirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';
import { ModelSigner, SelfSigner } from '../../Sdk/Web/ModelSigner';
import { generateRawSigned } from '../../Sdk/Utils/RawSignedModelUtils';

const init = () => {
	const crypto = createVirgilCrypto();
	const cardCrypto = new VirgilCardCrypto(crypto);
	return {
		crypto,
		cardCrypto,
		signer: new ModelSigner(cardCrypto)
	};
};

describe('ModelSigner', () => {
	it ('adds self signature (STC-8)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});

		signer.sign({ model, signerPrivateKey: keyPair.privateKey });
		const selfSignature = model.signatures[0];
		assert.isOk(selfSignature, 'signature appended');
		assert.equal(selfSignature.signer, SelfSigner, 'signature has `self` signer type');
		assert.notOk(selfSignature.snapshot, 'signature does not have snapshot');
		assert.isTrue(
			crypto.verifySignature(model.contentSnapshot, selfSignature.signature, keyPair.publicKey),
			'self signature is valid'
		);
	});

	it ('throws when self-signing twice (STC-8)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});

		signer.sign({ model, signerPrivateKey: keyPair.privateKey });

		assert.throws(() => {
			signer.sign({ model, signerPrivateKey: keyPair.privateKey });
		}, Error);
	});

	it ('add signature with custom signer type (STC-8)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});
		const keyPair2 = crypto.generateKeys();

		signer.sign({ model, signerPrivateKey: keyPair2.privateKey, signer: 'test' });

		const testSignature = model.signatures[0];
		assert.isOk(testSignature, 'signature appended');
		assert.equal(testSignature.signer, 'test', 'signature has `test` signer type');
		assert.notOk(testSignature.snapshot, 'signature does not have snapshot');
		assert.isTrue(
			crypto.verifySignature(model.contentSnapshot, testSignature.signature, keyPair2.publicKey),
			'test signature is valid'
		);
	});

	it ('throws when signing with the same signer type twice (STC-8)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});
		const keyPair2 = crypto.generateKeys();

		signer.sign({ model, signerPrivateKey: keyPair2.privateKey, signer: 'test' });

		assert.throws(() => {
			signer.sign({ model, signerPrivateKey: keyPair2.privateKey, signer: 'test' });
		}, Error);
	});

	it ('adds self signature with additional data (STC-9)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});
		const extraFields = {
			custom: 'value'
		};

		signer.sign({ model, signerPrivateKey: keyPair.privateKey, extraFields });
		const selfSignature = model.signatures[0];
		assert.isOk(selfSignature, 'signature appended');
		assert.equal(selfSignature.signer, SelfSigner, 'signature has `self` signer type');
		assert.isOk(selfSignature.snapshot, 'signature does has snapshot');
		assert.isTrue(
			crypto.verifySignature(
				Buffer.concat([model.contentSnapshot, selfSignature.snapshot!]),
				selfSignature.signature,
				keyPair.publicKey
			),
			'self signature is valid'
		);
	});

	it ('add signature with custom signer type and additional data (STC-9)', () => {
		const { crypto, cardCrypto, signer } = init();
		const keyPair = crypto.generateKeys();
		const model = generateRawSigned(cardCrypto, {
			privateKey: keyPair.privateKey,
			publicKey: keyPair.publicKey,
			identity: 'user@example.com'
		});
		const keyPair2 = crypto.generateKeys();
		const extraFields = {
			custom: 'value'
		};

		signer.sign({ model, signerPrivateKey: keyPair2.privateKey, signer: 'test', extraFields });

		const testSignature = model.signatures[0];
		assert.isOk(testSignature, 'signature appended');
		assert.equal(testSignature.signer, 'test', 'signature has `test` signer type');
		assert.isOk(testSignature.snapshot, 'signature does not have snapshot');
		assert.isTrue(
			crypto.verifySignature(
				Buffer.concat([model.contentSnapshot, testSignature.snapshot!]),
				testSignature.signature,
				keyPair2.publicKey
			),
			'test signature is valid'
		);
	});
});
