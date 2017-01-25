/**
 * @fileoverview A factory function used to create objects capable of signing
 * requests to Virgil Services.
 *
 * */

'use strict';

/**
 * The factory function used to create <code>RequestSigner</code> instances.
 * <code>RequestSigner</code> objects are not to be created directly using
 * the <code>new</code> keyword.
 *
 * @example
 *
 * var signer = virgil.requestSigner(virgil.crypto);
 *
 * @constructs RequestSigner
 * */
function requestSigner(crypto) {

	return /** @lends Request Signer */ {
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
