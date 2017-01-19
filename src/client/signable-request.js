/**
 * @fileoverview A class that allows to construct and digitally sign request
 * to the Virgil Security Cards Service.
 *
 * */

'use strict';

var assign = require('../shared/utils').assign;
var stringToBuffer = require('../shared/utils').stringToBuffer;
var serializer = require('../shared/serializer');

var privateData = new WeakMap();

/**
 * Initializes a new request with the given snapshot,
 * signatures and parameters.
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

	assign(this, params);
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
SignableRequest.prototype.getRequestModel = function () {
	var privateFields = privateData.get(this);
	var requestModel =  {
		content_snapshot: privateFields.snapshot,
		meta: {
			signs: privateFields.signatures
		}
	};

	return serializer.serializeSignedContent(requestModel);
};

/**
 * Exports the request to base64-encoded string.
 *
 * @returns {string}
 * */
SignableRequest.prototype.export = function () {
	var json = JSON.stringify(this.getRequestModel());
	return stringToBuffer(json).toString('base64');
};

/**
 * Creates a new request instance with the given parameters.
 *
 * returns {SignableRequest} - The newly created request.
 * */
function createSignableRequest (params) {
	var snapshot = stringToBuffer(JSON.stringify(params));
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
	var requestJSON = stringToBuffer(exportedRequest, 'base64')
						.toString('utf8');
	var requestModel = serializer.deserializeSignedContent(
									JSON.parse(requestJSON));
	var snapshot = requestModel.content_snapshot;
	var signatures = requestModel.meta.signs;
	var params = JSON.parse(snapshot.toString('utf8'));

	return new SignableRequest(snapshot, signatures, params);
}

module.exports = {
	createSignableRequest: createSignableRequest,
	importSignableRequest: importSignableRequest
};
