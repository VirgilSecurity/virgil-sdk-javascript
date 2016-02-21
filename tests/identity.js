var Promise = require('bluebird');
var test = require('tape');
var virgil = require('./helpers/virgil');
var mailinator = require('./helpers/mailinator');

var username = 'testjssdk' + Math.random();

test('identity verify flow', function testVerify (t) {
	var requestParams = {
		"type": "email",
		"value": username + "@mailinator.com"
	}

	virgil.identity.verify(requestParams)
		.tap(assertVerifyResponse)
		.then(getConfirmationToken)
		.spread(confirm)
		.tap(assertConfirmResponse)
		.then(validateToken)
		.then(assertTokenValidation)
		.catch(console.error);


	function assertVerifyResponse (res) {
		t.ok(typeof res.action_id === 'string', 'there is action_id in verify response');
	}

	function getConfirmationToken (res) {
		logResponse('identity.verify', res);
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				mailinator.getMessagesAsync(username)
					.then(function (messages) {
						return mailinator.readMessageAsync(messages[messages.length - 1].id)
							.then(function (message) {
								var matches = message.data.parts[0].body.match(/\>(.+)\<\/b\>/);
								return [matches[1], res.action_id];
							});
					})
					.then(resolve)
					.catch(reject);
			}, 200);
		});
	}

	function confirm (confirmationCode, actionId) {
		t.ok(typeof confirmationCode === 'string' && confirmationCode.length === 6, 'confirmation code exists');

		return virgil.identity.confirm({
			action_id: actionId,
			confirmation_code: confirmationCode,
			token: {
				time_to_live: 3600,
				count_to_live: 1
			}
		});
	}

	function assertConfirmResponse (res) {
		logResponse('identity.confirm', res);

		t.equal(res.type, 'email', 'confirm response type is email');
		t.equal(res.value, requestParams.value, 'confirm response value matches');
		t.ok(typeof res.validation_token === 'string', 'validation token is string');
	}

	function validateToken (res) {
		return virgil.identity.validate(res);
	}

	function assertTokenValidation (res) {
		logResponse('identity.validate', res);
		t.end();
	}
});

function logResponse (label, res) {
	console.log('\n%s:\n', label);
	console.log(res);
	console.log('\n');
}
