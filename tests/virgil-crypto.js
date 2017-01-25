var test = require('tape');
var virgil = require('../');
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
