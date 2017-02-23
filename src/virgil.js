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
var VirgilAPI = require('./virgil-api');

var initAPI = function (config) {
	return new VirgilAPI(config)
};

var virgil = {
	client: createVirgilClient,
	crypto: virgilCrypto,
	publishCardRequest: publishCardRequest,
	revokeCardRequest: revokeCardRequest,
	requestSigner: requestSigner,
	cardValidator: cardValidator,
	IdentityType: IdentityType,
	CardScope: CardScope,
	RevocationReason: RevocationReason,
	API: initAPI
};

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
