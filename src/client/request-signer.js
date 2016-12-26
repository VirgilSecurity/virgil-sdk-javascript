/**
 * Creates an object capable of signing requests to Virgil Services
 * */
function requestSigner(crypto) {

	return {
		selfSign: selfSign,
		authoritySign: authoritySign
	};

	/**
	 * Appends an owner's signature to the request
	 *
	 * @param {Object} request - Request to sign
	 * @param {PrivateKey} privateKey - Owner's private key
	 *
	 * @returns {Object} Request Signer
	 * */
	function selfSign(request, privateKey) {
		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		var id = fingerprint.toString('hex');
		request.appendSignature(id, crypto.sign(fingerprint, privateKey));
		return this;
	}

	/**
	 * Appends a signature of an authority on behalf of which the Card is being
	 * created/revoked to the request
	 *
	 * @param {Object} request - Request to sign
	 * @param {string} signerId - Id of an authority
	 * @param {PrivateKey} privateKey - Authority's private key
	 *
	 * @returns {Object} Request Signer
	 * */
	function authoritySign(request, signerId, privateKey) {
		var fingerprint = crypto.calculateFingerprint(request.getSnapshot());
		request.appendSignature(signerId, crypto.sign(fingerprint, privateKey));
		return this;
	}
}

module.exports = requestSigner;
