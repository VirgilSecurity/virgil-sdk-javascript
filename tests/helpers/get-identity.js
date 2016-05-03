var Promise = require('bluebird');
var virgil = require('./virgil');
var mailinator = require('./mailinator');

module.exports = function (email) {
	var username = 'testjssdk' + Math.random();
	var requestParams = {
		"type": "email",
		"value": username + "@mailinator.com"
	}

	return virgil.identity.verify(requestParams)
		.then(getConfirmationToken)
		.spread(confirm)
		.catch(console.error);

	function getConfirmationToken (res) {
		return new Promise(function (resolve, reject) {
			setTimeout(function () {
				mailinator.getMessagesAsync(username)
					.then(function (messages) {
						if (!messages || !messages.length) {
							throw new Error('Failed to fetch emails from mailinator');
						}

						return mailinator.readMessageAsync(messages[messages.length - 1].id)
							.then(function (message) {
								var matches = message.data.parts[0].body.match(/\>(.+)\<\/b\>/);
								return [matches[1], res.action_id];
							});
					})
					.then(resolve)
					.catch(reject);
			}, 10000);
		});
	}

	function confirm (confirmationCode, actionId) {
		return virgil.identity.confirm({
			action_id: actionId,
			confirmation_code: confirmationCode,
			token: {
				time_to_live: 3600,
				count_to_live: 2
			}
		});
	}
}
