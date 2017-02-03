var Promise = require('bluebird');
var assert = require('assert');
var mailinator = require('mailinator');

assert(process.env.VIRGIL_MAILINATOR_TOKEN, 'env.VIRGIL_MAILINATOR_TOKEN is required');

var mailinatorClient = Promise.promisifyAll(mailinator({
	token: process.env.VIRGIL_MAILINATOR_TOKEN
}));

mailinatorClient.getConfirmationCode = getConfirmationCode;
module.exports = mailinatorClient;

function getConfirmationCode(username) {
	return retryAsync(function () {
		return mailinatorClient.getMessagesAsync(username)
			.then(function (messages) {
				if (messages.length > 0) {
					return messages;
				}
				throw { isTransient: true };
			});
	}, 5, 5000)
	.then(function (messages) {
		return mailinatorClient.readMessageAsync(
			messages[messages.length - 1].id);
	})
	.then(function (message) {
		var matches = message.data.parts[0].body.match(/\>(.+)\<\/b\>/);
		return matches[1];
	});
}

function retryAsync (fn, retryCount, interval) {
	return fn().catch(function (err) {
		if (!err.isTransient) {
			throw err;
		}

		if (retryCount === 0) {
			throw { code: 'ETIMEDOUT', message: 'Could not get messages from mailinator.' };
		}

		return Promise.delay(interval).then(function () {
			return retryAsync(fn, retryCount - 1, interval);
		});
	});
}
