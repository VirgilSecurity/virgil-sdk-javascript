var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var mailinator = require('./helpers/mailinator');
var virgil = require('../');

var username = 'testjssdk' + Math.random();

function setup () {
	return virgil.client(virgilConfig.accessToken, virgilConfig);
}

test('identity verify flow', function testVerify (t) {
	var client = setup();

	var identity = username + "@mailinator.com";
	var identityType = virgil.IdentityType.EMAIL;

	client.verifyIdentity(identity, identityType)
		.tap(assertVerifyResponse)
		.then(getConfirmationToken)
		.spread(confirm)
		.tap(assertConfirmResponse)
		.then(validateToken)
		.then(assertTokenValidation)
		.catch(console.error);


	function assertVerifyResponse (res) {
		t.ok(typeof res === 'string', 'returns action id as string');
	}

	function getConfirmationToken (actionId) {
		return mailinator.getConfirmationCode(username)
			.then(function (code) {
				return [code, actionId];
			});
	}

	function confirm (confirmationCode, actionId) {
		t.ok(typeof confirmationCode === 'string' &&
			confirmationCode.length === 6, 'confirmation code exists');

		return client.confirmIdentity(actionId, confirmationCode);
	}

	function assertConfirmResponse (validationToken) {
		t.ok(typeof validationToken === 'string',
			'validation token is string');
	}

	function validateToken (token) {
		return client.validateIdentity(identity, identityType, token);
	}

	function assertTokenValidation (res) {
		t.ok(res, 'token is valid');
		t.end();
	}
});

test('identity server error', function test (t) {
	var client = setup();

	var identity = username + "@mailinator.com";
	var identityType = 'invalid';

	client.verifyIdentity(identity, identityType)
		.catch(function (e) {
			t.equal(e.code, 40100, 'error code match');
			t.end();
		});
});
