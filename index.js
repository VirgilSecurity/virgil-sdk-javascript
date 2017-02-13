var VirgilCrypto = require('virgil-crypto');
var createVirgilCrypto = require('./src/crypto/virgil-crypto');
var createVirgilClient = require('./src/client/virgil-client');
var publishCardRequest = require('./src/client/publish-card-request');
var revokeCardRequest = require('./src/client/revoke-card-request');
var requestSigner = require('./src/client/request-signer');
var cardValidator = require('./src/client/card-validator');
var CardModel = require('./src/client/card-model');
var IdentityType = require('./src/client/card-identity-type');
var CardScope = require('./src/client/card-scope');
var RevocationReason = require('./src/client/card-revocation-reason');

var virgil = {
	client: createVirgilClient,
	crypto: createVirgilCrypto(),
	publishCardRequest: publishCardRequest,
	revokeCardRequest: revokeCardRequest,
	requestSigner: requestSigner,
	cardValidator: cardValidator,
	IdentityType: IdentityType,
	CardScope: CardScope,
	RevocationReason: RevocationReason
};

// umd export support
virgil.virgil = virgil;

// Expose Buffer
virgil.Buffer = VirgilCrypto.Buffer;

// Expose some utils
virgil.utils = {
	obfuscate: VirgilCrypto.obfuscate,
	importCard: CardModel.import
};

module.exports = virgil;
