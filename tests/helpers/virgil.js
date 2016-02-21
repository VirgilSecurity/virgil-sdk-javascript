var assert = require('assert');
var Virgil = require('../../');

assert(process.env.VIRGIL_APP_TOKEN, 'env.VIRGIL_APP_TOKEN is required');
assert(process.env.VIRGIL_IDENTITY_URL, 'env.VIRGIL_IDENTITY_URL is required');
assert(process.env.VIRGIL_CARDS_URL, 'env.VIRGIL_CARDS_URL is required');
assert(process.env.VIRGIL_PUBLIC_KEY_URL, 'env.VIRGIL_PUBLIC_KEY_URL is required');

module.exports = new Virgil(
	process.env.VIRGIL_APP_TOKEN,
	{
		identityBaseUrl: process.env.VIRGIL_IDENTITY_URL,
		cardsBaseUrl: process.env.VIRGIL_CARDS_URL,
		publicKeysBaseUrl: process.env.VIRGIL_PUBLIC_KEY_URL
	}
);
