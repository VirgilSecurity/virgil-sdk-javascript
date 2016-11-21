var assert = require('assert');
var Virgil = require('../../');

assert(process.env.VIRGIL_APP_TOKEN_V3, 'env.VIRGIL_APP_TOKEN is required');
assert(process.env.VIRGIL_IDENTITY_URL_V3, 'env.VIRGIL_IDENTITY_URL is required');
assert(process.env.VIRGIL_CARDS_URL_V3, 'env.VIRGIL_CARDS_URL is required');
assert(process.env.VIRGIL_PUBLIC_KEYS_URL_V3, 'env.VIRGIL_PUBLIC_KEYS_URL is required');
assert(process.env.VIRGIL_PRIVATE_KEYS_URL_V3, 'env.VIRGIL_PRIVATE_KEYS_URL is required');


module.exports = new Virgil(
	process.env.VIRGIL_APP_TOKEN_V3,
	{
		identityBaseUrl: process.env.VIRGIL_IDENTITY_URL_V3,
		cardsBaseUrl: process.env.VIRGIL_CARDS_URL_V3,
		publicKeysBaseUrl: process.env.VIRGIL_PUBLIC_KEYS_URL_V3,
		privateKeysBaseUrl: process.env.VIRGIL_PRIVATE_KEYS_URL_V3
	}
);
