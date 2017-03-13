var test = require('tape');
var virgil = require('../../src/virgil');
var testData = require('./sdk-compatibility-data');

test('encrypt single recipient', function testVerify (t) {
	var testParams = testData.encrypt_single_recipient;
	var privateKey = virgil.crypto.importPrivateKey(testParams.private_key);

	var originalData = new Buffer(testParams.original_data, 'base64');
	var cipherData = new Buffer(testParams.cipher_data, 'base64');
	var decryptedData = virgil.crypto.decrypt(cipherData, privateKey);

	t.plan(1);
	t.ok(decryptedData.equals(originalData),
		'Decrypted and original data match.');
});

test('encrypt multiple recipients', function testVerify (t) {
	var testParams = testData.encrypt_multiple_recipients;
	var originalData = new Buffer(testParams.original_data, 'base64');
	var cipherData = new Buffer(testParams.cipher_data, 'base64');

	testParams.private_keys.forEach(function (privateKeyBase64) {
		var privateKey = virgil.crypto.importPrivateKey(privateKeyBase64);
		var decryptedData = virgil.crypto.decrypt(cipherData, privateKey);

		t.ok(decryptedData.equals(originalData),
			'Decrypted and original data match.');
	});

	t.end();
});

test('sign then encrypt single recipient', function testVerify (t) {
	var testParams = testData.sign_then_encrypt_single_recipient;
	var privateKey = virgil.crypto.importPrivateKey(testParams.private_key);
	var publicKey = virgil.crypto.extractPublicKey(privateKey);
	var originalData = new Buffer(testParams.original_data, 'base64');
	var cipherData = new Buffer(testParams.cipher_data, 'base64');

	var decryptedData = virgil.crypto.decryptThenVerify(
		cipherData,
		privateKey,
		publicKey);

	t.plan(1);
	t.ok(decryptedData.equals(originalData),
		'Decrypted and original data match.');
});

test('sign then encrypt multiple recipients', function testVerify (t) {
	var testParams = testData.sign_then_encrypt_multiple_recipients;
	var originalData = new Buffer(testParams.original_data, 'base64');
	var cipherData = new Buffer(testParams.cipher_data, 'base64');
	var senderKey = virgil.crypto.importPrivateKey(testParams.private_keys[0]);
	var senderPublicKey = virgil.crypto.extractPublicKey(senderKey);

	testParams.private_keys.forEach(function (privateKeyBase64) {
		var privateKey = virgil.crypto.importPrivateKey(privateKeyBase64);
		var decryptedData = virgil.crypto.decryptThenVerify(
			cipherData,
			privateKey,
			senderPublicKey);

		t.ok(decryptedData.equals(originalData),
			'Decrypted and original data match.');
	});

	t.end();
});

test('generate signature', function testVerify (t) {
	var testParams = testData.generate_signature;
	var originalData = new Buffer(testParams.original_data, 'base64');
	var signature = new Buffer(testParams.signature, 'base64');
	var privateKey = virgil.crypto.importPrivateKey(testParams.private_key);

	var mySignature = virgil.crypto.sign(originalData, privateKey);

	t.plan(1);
	t.ok(mySignature.equals(signature), 'Signatures match');
});

test('export signable request', function testVerify (t) {
	var testParams = testData.export_signable_request;
	var privateKey = virgil.crypto.importPrivateKey(testParams.private_key);
	var publicKey = virgil.crypto.extractPublicKey(privateKey);
	var importedRequest = virgil.publishCardRequest.import(
		testParams.exported_request);

	var fingerprint = virgil.crypto.calculateFingerprint(
		importedRequest.getSnapshot());
	var ownerSign = importedRequest.getSignature(fingerprint.toString('hex'));

	t.ok(Buffer.isBuffer(ownerSign), 'Owner\'s signature exists');
	t.ok(virgil.crypto.verify(fingerprint, ownerSign, publicKey),
		'Owner\'s signature verified');
	t.end();
});
