/**
 * @fileoverview A class that allows to construct and digitally sign request
 * to the Virgil Security Cards Service.
 *
 * */

'use strict';

var utils = require('../shared/utils');

var privateData = new WeakMap();

/**
 * Initializes a new request with the given snapshot,
 * signatures and parameters.
 *
 * @class
 *
 * @param {Buffer} snapshot - The snapshot of request.
 * @param {Object} signatures - Object representing a mapping from signer ids
 * 		to the signatures.
 * @param {Object} params - Request parameters.
 *
 * @constructor
 * */
function SignableRequest (snapshot, signatures, params) {
	privateData.set(this, {
		snapshot: snapshot,
		signatures: signatures
	});

	utils.assign(this, params);
}

/**
 * Returns the snapshot of the request.
 *
 * @returns {Buffer} The snapshot.
 * */
SignableRequest.prototype.getSnapshot = function () {
	return privateData.get(this).snapshot;
};

/**
 * Appends a signature to the request.
 *
 * @param {string} signerId - Id of the signer.
 * @param {Buffer} signature - The signature bytes.
 * */
SignableRequest.prototype.appendSignature = function (signerId, signature) {
	privateData.get(this).signatures[signerId] = signature;
};

/**
 * Returns a signature corresponding to the given signer id,
 * or {code: null} if not found.
 *
 * @param {string} signerId - Id of the signer.
 *
 * @returns {Buffer} Either the signature or {code: null}.
 * */
SignableRequest.prototype.getSignature = function (signerId) {
	return privateData.get(this).signatures[signerId] || null;
};

/**
 * Returns serializable representation of the request.
 *
 * @returns {Object}
 * */
SignableRequest.prototype.getRequestBody = function () {
	var privateFields = privateData.get(this);
	return  {
		content_snapshot: utils.bufferToBase64(privateFields.snapshot),
		meta: {
			signs: utils.mapValues(privateFields.signatures,
									utils.bufferToBase64)
		}
	};
};

/**
 * Exports the request to base64-encoded string.
 *
 * @returns {string}
 * */
SignableRequest.prototype.export = function () {
	var json = JSON.stringify(this.getRequestBody());
	return utils.stringToBase64(json);
};

/**
 * Creates a new request instance with the given parameters.
 *
 * returns {SignableRequest} - The newly created request.
 * */
function createSignableRequest (params) {
	var json = JSON.stringify(params);
	var snapshot = utils.stringToBuffer(json);
	var signatures = Object.create(null);

	return new SignableRequest(snapshot, signatures, params);
}

/**
 * Creates a new request instance from the previously exported request.
 * The new request has the exact same snapshot as the exported one.
 *
 * returns {SignableRequest} - The imported request.
 * */
function importSignableRequest (exportedRequest) {
	var requestJSON = utils.base64ToString(exportedRequest);
	var requestModel = JSON.parse(requestJSON);
	var snapshot = utils.base64ToBuffer(requestModel.content_snapshot);
	var signatures = utils.mapValues(requestModel.meta.signs, utils.base64ToBuffer);
	var params = JSON.parse(snapshot.toString('utf8'));

	return new SignableRequest(snapshot, signatures, params);
}

module.exports = {
	createSignableRequest: createSignableRequest,
	importSignableRequest: importSignableRequest
};
