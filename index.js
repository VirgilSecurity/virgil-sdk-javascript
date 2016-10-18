var VirgilCrypto = require('virgil-crypto');
var initVirgilCrypto = require('./src/crypto/virgil-crypto');
var createVirgilClient = require('./src/client/virgil-client');
var cardRequest = require('./src/client/card-request');
var cardRevokeRequest = require('./src/client/card-revoke-request');
var requestSigner = require('./src/common/request-signer');
var cardValidator = require('./src/common/card-validator');

VirgilCrypto = VirgilCrypto.VirgilCrypto || VirgilCrypto;

var virgil = {
	client: createVirgilClient,
	crypto: initVirgilCrypto(),
	cardCreateRequest: cardRequest,
	cardRevokeRequest: cardRevokeRequest,
	requestSigner: requestSigner,
	cardValidator: cardValidator
};

// umd export support
virgil.virgil = virgil;

// Expose Buffer
virgil.Buffer = VirgilCrypto.Buffer;

// Expose some utils
virgil.utils = {
	obfuscate: VirgilCrypto.obfuscate,
	generateValidationToken: VirgilCrypto.generateValidationToken
};

module.exports = virgil;
