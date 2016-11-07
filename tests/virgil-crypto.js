var test = require('tape');
var virgil = require('../');
var crypto = virgil.crypto;

test('sign then encrypt -> decrypt then verify', function (t) {
	var senderPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJCQlVZWXNvUWVvTm9YSWQxVzZHCjJxN2xBZ0lUN3pBS0JnZ3Foa2lHOXcwQ0NqQWRCZ2xnaGtnQlpRTUVBU29FRUpQSnJPZEtCdHNFZWdjTzc3dTEKTzZNRVFFVWlKTWtGTnpNck1sUjh6N0ZDVVZieDdaRkhENjJYdHI3bm5sU05VaG04V1U0L1ZqTHAwTk5xdERLTApPMjROaEcwa05iZUZaOXFlaFlUcU1sUXp3ejQ9Ci0tLS0tRU5EIEVOQ1JZUFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	senderPrivateKey = crypto.importPrivateKey(new Buffer(senderPrivateKey, 'base64'), '1234');
	var senderPublicKey = 'MCowBQYDK2VwAyEAmBZSnO/w/xhO8bb+NV/xykZp42pyty+dbsphBKdEYqA=';
	senderPublicKey = crypto.importPublicKey(new Buffer(senderPublicKey, 'base64'));

	var recipientPrivateKey = 'LS0tLS1CRUdJTiBFTkNSWVBURUQgUFJJVkFURSBLRVktLS0tLQpNSUdoTUYwR0NTcUdTSWIzRFFFRkRUQlFNQzhHQ1NxR1NJYjNEUUVGRERBaUJCQk5sMXEzeHBMTEh6Q2E5ODBMClVlMXdBZ0lPNGpBS0JnZ3Foa2lHOXcwQ0NqQWRCZ2xnaGtnQlpRTUVBU29FRU5XZGxvK1hnNnJqYmdIUEJPMXoKRG9nRVFBZDY3eCtBT2xrTzBYTDNKbUEvSU5wUXE4cmNtVzU0citSUTBRY0xaaGVUdU9QYXBnZEk4UGpKb0ZuWQpTUVp0WjRYby9TRllOeFdUZzk3Zi94V05SZmc9Ci0tLS0tRU5EIEVOQ1JZUFRFRCBQUklWQVRFIEtFWS0tLS0tCg==';
	recipientPrivateKey = crypto.importPrivateKey(new Buffer(recipientPrivateKey, 'base64'), '4321');
	var recipientPublicKey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQWNCTG1pZTFKam0rRC9BM0lQdVJVSUFsK0MvUlF0RWQ1cnhmb1BEMFlGbDQ9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';
	recipientPublicKey = crypto.importPublicKey(new Buffer(recipientPublicKey, 'base64'));

	var message = new Buffer('Secret message');

	var cipherData = crypto.signThenEncrypt(message, senderPrivateKey, recipientPublicKey);

	var decryptedMessage = crypto.decryptThenVerify(cipherData, recipientPrivateKey, senderPublicKey);

	t.plan(1);
	t.ok(decryptedMessage.equals(message), 'decrypted and original messages match');
});
