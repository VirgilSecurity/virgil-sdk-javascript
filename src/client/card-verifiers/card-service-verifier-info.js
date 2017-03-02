'use strict';

/**
 * @typedef {Object} CardVerifierInfo
 * @property {string} cardId - Id of the card whose signature is to be
 * 		verified.
 * @property {(Buffer|string)} publicKeyData - The public key to use
 * 		for signature verification.
 * */

// Id of the Card of the Virgil Cards Service
var SERVICE_CARD_ID = '3e29d43373348cfb373b7eae189214dc01d7237765e572d' +
	'b685839b64adca853';

// Public Key of the Virgil Cards Service
var SERVICE_PUBLIC_KEY = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JR' +
	'WURLMlZ3QXlFQVlSNTAxa1YxdFVuZTJ1T2RrdzRrRXJSUmJKcmMyU3lhejVWMWZ1R' +
	'ytyVnM9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';

module.exports = /** @type {CardVerifierInfo} */ {
	cardId: SERVICE_CARD_ID,
	publicKeyData: SERVICE_PUBLIC_KEY
};
