/**
 * @fileoverview A factory function used to create objects capable of signing
 * requests to Virgil Services.
 *
 * */

'use strict';

var utils = require('../shared/utils');

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
	 * Important! This should only be used to sign publishing requests, as the
	 * signer's card id is calculated from the request. To self-sign
	 * revocation request use the {@link authoritySign} method.
	 *
	 * @param {SignableRequest} request - The request to sign.
	 * @param {CryptoKeyHandle} privateKey - The owner's private key.
	 * */
	function selfSign(request, privateKey) {
		utils.assert(request,
			'selfSign expects request argument to be passed.');
		utils.assert(privateKey,
			'selfSign expects privateKey argument to be passed.');

		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		var signerId = fingerprint.toString('hex');

		request.appendSignature(
			signerId, crypto.sign(fingerprint, privateKey));
	}

	/**
	 * Appends a signature of the authority on behalf of which the request
	 * is being made to the request.
	 *
	 * @param {SignableRequest} request - Request to sign.
	 * @param {string} signerId - Id of the authority.
	 * @param {CryptoKeyHandle} privateKey - Authority's private key.
	 * */
	function authoritySign(request, signerId, privateKey) {
		utils.assert(request,
			'authoritySign expects request argument to be passed.');
		utils.assert(signerId,
			'authoritySign expects signerId argument to be passed.');
		utils.assert(privateKey,
			'authoritySign expects privateKey argument to be passed.');

		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		request.appendSignature(signerId,
			crypto.sign(fingerprint, privateKey));
	}
}

module.exports = requestSigner;
