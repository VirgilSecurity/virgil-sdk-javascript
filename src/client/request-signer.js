'use strict';

/**
 * Creates an object capable of signing requests to Virgil Services
 * */
function requestSigner(crypto) {

	return {
		selfSign: selfSign,
		authoritySign: authoritySign
	};

	/**
	 * Appends an owner's signature to the request.
	 *
	 * @param {SignableRequest} request - The request to sign.
	 * @param {CryptoKeyHandle} privateKey - The owner's private key.
	 *
	 * @returns {Object} Request Signer.
	 * */
	function selfSign(request, privateKey) {
		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		var id = fingerprint.toString('hex');
		request.appendSignature(id, crypto.sign(fingerprint, privateKey));
		return this;
	}

	/**
	 * Appends a signature of the authority on behalf of which the request
	 * is being made to the request.
	 *
	 * @param {SignableRequest} request - Request to sign.
	 * @param {string} signerId - Id of the authority.
	 * @param {CryptoKeyHandle} privateKey - Authority's private key.
	 *
	 * @returns {Object} Request Signer.
	 * */
	function authoritySign(request, signerId, privateKey) {
		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		request.appendSignature(signerId,
			crypto.sign(fingerprint, privateKey));
		return this;
	}
}

module.exports = requestSigner;
