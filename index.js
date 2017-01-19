var VirgilCrypto = require('virgil-crypto');
var createVirgilCrypto = require('./src/crypto/virgil-crypto');
var createVirgilClient = require('./src/client/virgil-client');
var cardRequest = require('./src/client/create-card-request');
var cardRevokeRequest = require('./src/client/revoke-card-request');
var requestSigner = require('./src/client/request-signer');
var cardValidator = require('./src/client/card-validator');
var Card = require('./src/client/card');


var virgil = {
	client: createVirgilClient,
	crypto: createVirgilCrypto(),
	createCardRequest: cardRequest,
	revokeCardRequest: cardRevokeRequest,
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
	importCard: Card.import
};

module.exports = virgil;
