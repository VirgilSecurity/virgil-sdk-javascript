'use strict';

var VirgilCrypto = require('virgil-crypto');
var virgilCrypto = require('./crypto/virgil-crypto');
var createVirgilClient = require('./client/virgil-client');
var publishCardRequest = require('./client/publish-card-request');
var revokeCardRequest = require('./client/revoke-card-request');
var requestSigner = require('./client/request-signer');
var cardValidator = require('./client/card-validator');
var CardModel = require('./client/card-model');
var IdentityType = require('./client/card-identity-type');
var CardScope = require('./client/card-scope');
var RevocationReason = require('./client/card-revocation-reason');
var cardManager = require('./card-manager');
var keyManager = require('./key-manager');
var virgilAPIContext = require('./virgil-api-context');
var utils = require('./shared/utils');

/**
 *
 * @param {(string|VirgilAPIConfig)} config - Virgil access token or Virgil
 * 		API configuration object.
 * @constructs {VirgilAPI}
 */
function virgil (config) {
	utils.assert(utils.isString(config) || utils.isObject(config),
		'Virgil API requires a configuration object or an access token ' +
		'string.');

	if (utils.isString(config)) {
		config = { accessToken: config };
	}

	var context = virgilAPIContext(config);

	return /** @lends {VirgilAPI} */ {
		/** @type {KeyManager} */
		keys: keyManager(context),
		/** @type {CardManager} */
		cards: cardManager(context)
	};
}

virgil.client = createVirgilClient;
virgil.crypto = virgilCrypto;
virgil.publishCardRequest = publishCardRequest;
virgil.revokeCardRequest = revokeCardRequest;
virgil.requestSigner = requestSigner;
virgil.cardValidator = cardValidator;
virgil.IdentityType = IdentityType;
virgil.CardScope = CardScope;
virgil.RevocationReason = RevocationReason;

// Expose Buffer
virgil.Buffer = VirgilCrypto.Buffer;

// Expose some utils
virgil.utils = {
	obfuscate: VirgilCrypto.obfuscate,
	importCard: CardModel.import
};

// umd export support
virgil.virgil = virgil;

module.exports = virgil;
