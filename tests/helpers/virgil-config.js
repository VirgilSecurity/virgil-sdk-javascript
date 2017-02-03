var assert = require('assert');

assert(process.env.VIRGIL_APP_TOKEN, 'env.VIRGIL_APP_TOKEN is required');
assert(process.env.VIRGIL_IDENTITY_URL, 'env.VIRGIL_IDENTITY_URL is required');
assert(process.env.VIRGIL_CARDS_URL, 'env.VIRGIL_CARDS_URL is required');
assert(process.env.VIRGIL_CARDS_READ_URL, 'env.VIRGIL_CARDS_READ_URL is required');
assert(process.env.VIRGIL_RA_URL, 'env.VIRGIL_CARDS_READ_URL is required');
assert(process.env.VIRGIL_APP_CARD_ID, 'env.VIRGIL_APP_CARD_ID is required');
assert(process.env.VIRGIL_APP_PRIVATE_KEY, 'env.VIRGIL_APP_PRIVATE_KEY is required');
assert(process.env.VIRGIL_APP_PRIVATE_KEY_PWD, 'env.VIRGIL_APP_PRIVATE_KEY_PWD is required');


module.exports = {
	accessToken: process.env.VIRGIL_APP_TOKEN,
	identityBaseUrl: process.env.VIRGIL_IDENTITY_URL,
	cardsBaseUrl: process.env.VIRGIL_CARDS_URL,
	cardsReadBaseUrl: process.env.VIRGIL_CARDS_READ_URL,
	registrationAuthorityBaseUrl: process.env.VIRGIL_RA_URL,
	appCardId: process.env.VIRGIL_APP_CARD_ID,
	appPrivateKey: process.env.VIRGIL_APP_PRIVATE_KEY,
	appPrivateKeyPassword: process.env.VIRGIL_APP_PRIVATE_KEY_PWD
};
