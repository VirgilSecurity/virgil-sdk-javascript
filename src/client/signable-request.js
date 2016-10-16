import {
	serializePublicKey,
	deserializePublicKey,
	serializeSignatures,
	deserializeSignatures,
	serializeContentSnapshot,
	deserializeContentSnapshot } from '../utils/serializer';

export function signableRequest (reqData) {
	if (reqData.public_key) {
		reqData.public_key = serializePublicKey(reqData.public_key);
	}

	const snapshot = new Buffer(JSON.stringify(reqData));
	const signatures = {};

	return {
		getSnapshot,
		appendSignature,
		toTransferFormat
	};

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
			content_snapshot: serializeContentSnapshot(snapshot),
			meta: {
				signs: serializeSignatures(signatures)
			}
		}
	}
}

export function signableRequestFromTransferFormat(dto) {
	const contentJSON = deserializeContentSnapshot(dto.content_snapshot).toString('utf8');
	const params = JSON.parse(contentJSON);
	if (params.public_key) {
		params.public_key = deserializePublicKey(params.public_key);
	}

	const request = this.call(null, params);
	const signatures = deserializeSignatures(dto.meta.signs);

	Object.entries(signatures).forEach(([ signerId, signature ]) => request.appendSignature(signerId, signature));

	return request;
}
