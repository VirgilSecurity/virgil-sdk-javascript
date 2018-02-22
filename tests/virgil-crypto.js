var test = require('tape');
var virgil = require('../src/virgil');
var virgilCrypto = virgil.crypto;

test('sign then encrypt -> decrypt then verify', function (t) {
	var senderPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS' +
		'0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJ' +
		'CQlVZWXNvUWVvTm9YSWQxVzZHCjJxN2xBZ0lUN3pBS0JnZ3Foa2lHOXcwQ0NqQWRC' +
		'Z2xnaGtnQlpRTUVBU29FRUpQSnJPZEtCdHNFZWdjTzc3dTEKTzZNRVFFVWlKTWtGT' +
		'npNck1sUjh6N0ZDVVZieDdaRkhENjJYdHI3bm5sU05VaG04V1U0L1ZqTHAwTk5xdE' +
		'RLTApPMjROaEcwa05iZUZaOXFlaFlUcU1sUXp3ejQ9Ci0tLS0tRU5EIEVOQ1JZUFR' +
		'FRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var senderPublicKey = 'MCowBQYDK2VwAyEAmBZSnO/w/xhO8bb+NV/xykZp42pyty+' +
		'dbsphBKdEYqA=';
	var recipientPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVk' +
		'tLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERB' +
		'aUJCQk5sMXEzeHBMTEh6Q2E5ODBMClVlMXdBZ0lPNGpBS0JnZ3Foa2lHOXcwQ0NqQ' +
		'WRCZ2xnaGtnQlpRTUVBU29FRU5XZGxvK1hnNnJqYmdIUEJPMXoKRG9nRVFBZDY3eC' +
		'tBT2xrTzBYTDNKbUEvSU5wUXE4cmNtVzU0citSUTBRY0xaaGVUdU9QYXBnZEk4UGp' +
		'Kb0ZuWQpTUVp0WjRYby9TRllOeFdUZzk3Zi94V05SZmc9Ci0tLS0tRU5EIEVOQ1JZ' +
		'UFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var recipientPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JR' +
		'WURLMlZ3QXlFQWNCTG1pZTFKam0rRC9BM0lQdVJVSUFsK0MvUlF0RWQ1cnhmb1BEM' +
		'FlGbDQ9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';

	senderPrivateKey = virgilCrypto.importPrivateKey(senderPrivateKey, '1234');
	senderPublicKey = virgilCrypto.importPublicKey(senderPublicKey);
	recipientPrivateKey = virgilCrypto.importPrivateKey(recipientPrivateKey, '4321');
	recipientPublicKey = virgilCrypto.importPublicKey(recipientPublicKey);

	var message = 'Secret message';

	var cipherData = virgilCrypto.signThenEncrypt(
		message,
		senderPrivateKey,
		recipientPublicKey);

	var decryptedMessage = virgilCrypto.decryptThenVerify(
		cipherData,
		recipientPrivateKey,
		senderPublicKey);

	t.plan(1);
	t.equals(decryptedMessage.toString(), message,
		'decrypted and original messages match');
});

test('calculate fingerprint', function (t) {
	var aliceData = JSON.stringify({ name: 'Alice' });
	var bobData = JSON.stringify({ name: 'Bob'});

	var aliceFingerprint = virgilCrypto.calculateFingerprint(aliceData);
	var bobFingerprint = virgilCrypto.calculateFingerprint(bobData);

	t.notOk(aliceFingerprint.equals(bobFingerprint),
		'Calculates different fingerprints for different data');

	var aliceFingerprint2 = virgilCrypto.calculateFingerprint(aliceData);
	t.ok(aliceFingerprint.equals(aliceFingerprint2),
		'Calculates same fingerprint for the same data');
	t.end();
});

test('sign and verify strings', function (t) {
	var data = JSON.stringify({ name: 'Default name' });
	var senderPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS' +
		'0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJ' +
		'CQlVZWXNvUWVvTm9YSWQxVzZHCjJxN2xBZ0lUN3pBS0JnZ3Foa2lHOXcwQ0NqQWRC' +
		'Z2xnaGtnQlpRTUVBU29FRUpQSnJPZEtCdHNFZWdjTzc3dTEKTzZNRVFFVWlKTWtGT' +
		'npNck1sUjh6N0ZDVVZieDdaRkhENjJYdHI3bm5sU05VaG04V1U0L1ZqTHAwTk5xdE' +
		'RLTApPMjROaEcwa05iZUZaOXFlaFlUcU1sUXp3ejQ9Ci0tLS0tRU5EIEVOQ1JZUFR' +
		'FRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var senderPublicKey = 'MCowBQYDK2VwAyEAmBZSnO/w/xhO8bb+NV/xykZp42pyty+' +
		'dbsphBKdEYqA=';

	senderPrivateKey = virgilCrypto.importPrivateKey(senderPrivateKey, '1234');
	senderPublicKey = virgilCrypto.importPublicKey(senderPublicKey);

	var signature = virgilCrypto.sign(data, senderPrivateKey)
		.toString('base64');
	var isValid = virgilCrypto.verify(data, signature, senderPublicKey);
	t.ok(isValid, 'Validates data when passed string arguments');
	t.end();
});

test('encrypt and decrypt strings', function (t) {
	var data = JSON.stringify({ name: 'Default name' });
	var recipientPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVk' +
		'tLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERB' +
		'aUJCQk5sMXEzeHBMTEh6Q2E5ODBMClVlMXdBZ0lPNGpBS0JnZ3Foa2lHOXcwQ0NqQ' +
		'WRCZ2xnaGtnQlpRTUVBU29FRU5XZGxvK1hnNnJqYmdIUEJPMXoKRG9nRVFBZDY3eC' +
		'tBT2xrTzBYTDNKbUEvSU5wUXE4cmNtVzU0citSUTBRY0xaaGVUdU9QYXBnZEk4UGp' +
		'Kb0ZuWQpTUVp0WjRYby9TRllOeFdUZzk3Zi94V05SZmc9Ci0tLS0tRU5EIEVOQ1JZ' +
		'UFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var recipientPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JR' +
		'WURLMlZ3QXlFQWNCTG1pZTFKam0rRC9BM0lQdVJVSUFsK0MvUlF0RWQ1cnhmb1BEM' +
		'FlGbDQ9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';

	recipientPrivateKey = virgilCrypto.importPrivateKey(
		recipientPrivateKey, '4321');
	recipientPublicKey = virgilCrypto.importPublicKey(recipientPublicKey);

	var cipherData = virgilCrypto.encrypt(data, recipientPublicKey)
		.toString('base64');
	var decryptedData = virgilCrypto.decrypt(cipherData, recipientPrivateKey);

	t.equal(decryptedData.toString(), data,
		'Decrypts data when passed string arguments');
	t.end();
});

test('export private key without password', function (t) {
	var privateKeyBase64 = 'MC4CAQAwBQYDK2VwBCIEIEoWpq/k3bzUkV9ci7CGwkD8mpD' +
		'480CVb1biGvEpmSvB';

	t.comment('before');
	var importedKey = virgilCrypto.importPrivateKey(privateKeyBase64);
	var exportedKey = virgilCrypto.exportPrivateKey(importedKey);

	t.comment('after');
	t.equal(exportedKey.toString('base64'), privateKeyBase64,
		'exported key is equal to imported one');
	t.end();
});

test('extract public key', function (t) {
	var privateKeyBase64 = 'MC4CAQAwBQYDK2VwBCIEIEoWpq/k3bzUkV9ci7CGwkD8mpD' +
		'480CVb1biGvEpmSvB';
	var publicKeyBase64 = 'MCowBQYDK2VwAyEA9OX9DOZ70JRq4RWNIhGDkmY4fGmip6Gd' +
		'V/VR3R6hmIQ=';

	var privateKey = virgilCrypto.importPrivateKey(privateKeyBase64);
	var publicKey = virgilCrypto.extractPublicKey(privateKey);
	var pubkeyData = virgilCrypto.exportPublicKey(publicKey);

	t.equal(pubkeyData.toString('base64'), publicKeyBase64,
		'extracted public key is equal to pre-computed');
	t.end();
});

test('sign then encrypt -> decrypt then verify multiple public keys', function (t) {
	var senderPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS' +
		'0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJ' +
		'CQlVZWXNvUWVvTm9YSWQxVzZHCjJxN2xBZ0lUN3pBS0JnZ3Foa2lHOXcwQ0NqQWRC' +
		'Z2xnaGtnQlpRTUVBU29FRUpQSnJPZEtCdHNFZWdjTzc3dTEKTzZNRVFFVWlKTWtGT' +
		'npNck1sUjh6N0ZDVVZieDdaRkhENjJYdHI3bm5sU05VaG04V1U0L1ZqTHAwTk5xdE' +
		'RLTApPMjROaEcwa05iZUZaOXFlaFlUcU1sUXp3ejQ9Ci0tLS0tRU5EIEVOQ1JZUFR' +
		'FRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var senderPublicKey = 'MCowBQYDK2VwAyEAmBZSnO/w/xhO8bb+NV/xykZp42pyty+' +
		'dbsphBKdEYqA=';
	var recipientPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVk' +
		'tLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERB' +
		'aUJCQk5sMXEzeHBMTEh6Q2E5ODBMClVlMXdBZ0lPNGpBS0JnZ3Foa2lHOXcwQ0NqQ' +
		'WRCZ2xnaGtnQlpRTUVBU29FRU5XZGxvK1hnNnJqYmdIUEJPMXoKRG9nRVFBZDY3eC' +
		'tBT2xrTzBYTDNKbUEvSU5wUXE4cmNtVzU0citSUTBRY0xaaGVUdU9QYXBnZEk4UGp' +
		'Kb0ZuWQpTUVp0WjRYby9TRllOeFdUZzk3Zi94V05SZmc9Ci0tLS0tRU5EIEVOQ1JZ' +
		'UFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var recipientPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JR' +
		'WURLMlZ3QXlFQWNCTG1pZTFKam0rRC9BM0lQdVJVSUFsK0MvUlF0RWQ1cnhmb1BEM' +
		'FlGbDQ9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';
	var otherPublicKey = 'MCowBQYDK2VwAyEAMiGqjvwO+0atRWjXVFEybGooQcpJO54C' +
		'mJPMp66WmsU=';

	senderPrivateKey = virgilCrypto.importPrivateKey(senderPrivateKey, '1234');
	senderPublicKey = virgilCrypto.importPublicKey(senderPublicKey);
	recipientPrivateKey = virgilCrypto.importPrivateKey(recipientPrivateKey, '4321');
	recipientPublicKey = virgilCrypto.importPublicKey(recipientPublicKey);
	otherPublicKey = virgilCrypto.importPublicKey(otherPublicKey);

	var message = 'Secret message';

	var cipherData = virgilCrypto.signThenEncrypt(
		message,
		senderPrivateKey,
		[ otherPublicKey, recipientPublicKey ]);

	var decryptedMessage = virgilCrypto.decryptThenVerify(
		cipherData,
		recipientPrivateKey,
		[ otherPublicKey, senderPublicKey ]);

	t.plan(1);
	t.equals(decryptedMessage.toString(), message,
		'decrypted and original messages match');
});

test('sign then encrypt -> decrypt then verify wrong public key', function (t) {
	var senderPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS' +
		'0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJ' +
		'CQlVZWXNvUWVvTm9YSWQxVzZHCjJxN2xBZ0lUN3pBS0JnZ3Foa2lHOXcwQ0NqQWRC' +
		'Z2xnaGtnQlpRTUVBU29FRUpQSnJPZEtCdHNFZWdjTzc3dTEKTzZNRVFFVWlKTWtGT' +
		'npNck1sUjh6N0ZDVVZieDdaRkhENjJYdHI3bm5sU05VaG04V1U0L1ZqTHAwTk5xdE' +
		'RLTApPMjROaEcwa05iZUZaOXFlaFlUcU1sUXp3ejQ9Ci0tLS0tRU5EIEVOQ1JZUFR' +
		'FRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var recipientPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVk' +
		'tLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERB' +
		'aUJCQk5sMXEzeHBMTEh6Q2E5ODBMClVlMXdBZ0lPNGpBS0JnZ3Foa2lHOXcwQ0NqQ' +
		'WRCZ2xnaGtnQlpRTUVBU29FRU5XZGxvK1hnNnJqYmdIUEJPMXoKRG9nRVFBZDY3eC' +
		'tBT2xrTzBYTDNKbUEvSU5wUXE4cmNtVzU0citSUTBRY0xaaGVUdU9QYXBnZEk4UGp' +
		'Kb0ZuWQpTUVp0WjRYby9TRllOeFdUZzk3Zi94V05SZmc9Ci0tLS0tRU5EIEVOQ1JZ' +
		'UFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	var recipientPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JR' +
		'WURLMlZ3QXlFQWNCTG1pZTFKam0rRC9BM0lQdVJVSUFsK0MvUlF0RWQ1cnhmb1BEM' +
		'FlGbDQ9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';
	var otherPublicKey = 'MCowBQYDK2VwAyEAMiGqjvwO+0atRWjXVFEybGooQcpJO54C' +
		'mJPMp66WmsU=';
	var anotherPublicKey = 'MCowBQYDK2VwAyEAylmHyTGVh/E3RrarH359UhrHO7z+Dg' +
		'uXJoueYLiF5VU=';

	senderPrivateKey = virgilCrypto.importPrivateKey(senderPrivateKey, '1234');
	recipientPrivateKey = virgilCrypto.importPrivateKey(recipientPrivateKey, '4321');
	recipientPublicKey = virgilCrypto.importPublicKey(recipientPublicKey);
	otherPublicKey = virgilCrypto.importPublicKey(otherPublicKey);
	anotherPublicKey = virgilCrypto.importPublicKey(anotherPublicKey);

	var message = 'Secret message';

	var cipherData = virgilCrypto.signThenEncrypt(
		message,
		senderPrivateKey,
		[ recipientPublicKey, otherPublicKey, anotherPublicKey ]);

	t.throws(function () {
			virgilCrypto.decryptThenVerify(
				cipherData,
				recipientPrivateKey,
				[ otherPublicKey, anotherPublicKey ]);
	},
	/Signature verification has failed/,
	'verification failed without the right public key');

	t.end();
});

test('verify throws when passed invalid value as signature', function (t) {
	var publicKey = 'MCowBQYDK2VwAyEAMiGqjvwO+0atRWjXVFEybGooQcpJO54CmJPMp66WmsU=';
	t.throws(function () {
		virgilCrypto.verify('some message', undefined, virgilCrypto.importPublicKey(publicKey))
	},
	/verify expects signature argument to be passed as a Buffer or a base64-encoded string/,
	'throws when invalid value for signature is passed');

	t.end();
});
