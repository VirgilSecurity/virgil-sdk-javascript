require('babel-register');

import { VirgilCrypto } from 'virgil-crypto';
import { virgilCrypto } from './src/crypto/virgil-crypto';
import { createVirgilClient } from './src/client/virgil-client';
import { cardRequest } from './src/client/card-request';
import { cardRevokeRequest } from './src/client/card-revoke-request';
import { requestSigner } from './src/common/request-signer';
import { cardValidator } from './src/common/card-validator';

const virgil = {
	client: createVirgilClient,
	crypto: virgilCrypto(),
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
