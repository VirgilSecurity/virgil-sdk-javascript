var serializer = require('../utils/serializer');
var assign = require('../utils/utils').assign;

function signableRequest (reqData) {
	if (reqData.public_key) {
		reqData.public_key = serializer.serializePublicKey(reqData.public_key);
	}

	var snapshot = new Buffer(JSON.stringify(reqData));
	var signatures = Object.create(null);

	var request = assign({}, reqData);
	request.getSnapshot = getSnapshot;
	request.appendSignature = appendSignature;
	request.toTransferFormat = toTransferFormat;

	return request;

	/**
	 * Returns the snapshot of the request
	 * */
	function getSnapshot() {
		return snapshot;
	}

	/**
	 * Appends a signature to the request
	 *
	 * @param {string} signerId - Id of signer
	 * @param {Buffer} signature - Signature value
	 * */
	function appendSignature(signerId, signature) {
		signatures[signerId] = signature;
	}

	/**
	 * Returns serializable representation of the request
	 *
	 * @returns {Object}
	 * */
	function toTransferFormat() {
		return {
			content_snapshot: serializer.serializeContentSnapshot(snapshot),
			meta: {
				signs: serializer.serializeSignatures(signatures)
			}
		}
	}
}

function signableRequestFromTransferFormat(dto) {
	const contentJSON = serializer.deserializeContentSnapshot(dto.content_snapshot).toString('utf8');
	const params = JSON.parse(contentJSON);
	if (params.public_key) {
		params.public_key = serializer.deserializePublicKey(params.public_key);
	}

	const request = this.call(null, params);
	const signatures = serializer.deserializeSignatures(dto.meta.signs);

	Object.keys(signatures).forEach(function (signerId) {
		request.appendSignature(signerId, signatures[signerId]);
	});

	return request;
}

module.exports = {
	signableRequest: signableRequest,
	signableRequestFromTransferFormat: signableRequestFromTransferFormat
};
