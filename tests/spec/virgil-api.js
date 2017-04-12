'use strict';

var test = require('tape');
var sinon = require('sinon');
var VirgilAPI = require('../../src/virgil-api');

function setup() {
	var cryptoStub = {
		encrypt: sinon.stub()
	};

	return {
		crypto: cryptoStub
	};
}

test('encryptFor', function (t) {
	var fixture = setup();

	var data = 'Data to encrypt';
	var publicKey = {};
	var cards = [{
		publicKey: publicKey
	}];
	var expected = new Buffer('Encrypted data');

	fixture.crypto.encrypt.withArgs(data, [publicKey]).returns(expected);

	var api = new VirgilAPI({ crypto: fixture.crypto });

	var actual = api.encryptFor(data, cards);
	t.equal(actual, expected, 'delegates encryption to crypto');
	t.end();
});

