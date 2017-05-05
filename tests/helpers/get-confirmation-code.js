'use strict';

var Promise = require('bluebird');
var mailinator = require('./mailinator');

var VIRGIL_IDENTITY_EMAIL = process.env.VIRGIL_IDENTITY_EMAIL_ADDRESS;

var emailClient = mailinator();

/**
 * Gets the Virgil Identity Confirmation code from the given email address.
 * Retries the query at most 5 times with 5 second delay in case no messages
 * are present. Deletes the message after successful code retrieval.
 *
 * @param {string} email - Email address to get the confirmation code from.
 * @returns {Promise<string>} - The confirmation code.
 */
module.exports = function getConfirmationCode(email) {
	return retryAsync(
		function () {
			return emailClient.getMessages(email)
				.then(function (messages) {
					var virgilMessages = messages.filter(function (message) {
						return message.fromfull === VIRGIL_IDENTITY_EMAIL;
					});
					if (virgilMessages.length > 0) {
						return virgilMessages.sort(function compareMessages(a, b) {
							return a.time - b.time;
						});
					}
					throw { isTransient: true };
				});
		}, 5, 5000
	).then(function (messages) {
		var latest = messages[messages.length - 1];
		return emailClient.readMessage(latest.id)
			.then(function (message) {
				var matches = message.data.parts[0].body.match(/\>(.+)\<\/b\>/);
				var code = matches[1];

				// delete the message right away so we don't read it twice in
				// cases where two confirmations with little delay between them
				// e.g. create - revoke global card
				return emailClient.deleteMessage(latest.id)
					.then(function () {
						return code;
					});
			});
	});
};

/**
 * Utility to cooperatively retry an async operation `retryCount` number of
 * times with `interval` ms delay between invocations.
 * @param {Function<Promise<*>>} fn - Async operation
 * @param {number} retryCount - Number of times to try before giving up by
 * 		throwing an error.
 * @param {number} interval - Number of milliseconds to wait between tries.
 * @returns {Promise<*>}
 */
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
