/**
 * @fileoverview A class that allows to construct and digitally sign request
 * to the Virgil Security Cards Service.
 *
 * */

/**
 * @typedef {Object} SignedRequestBody
 * @property {string} data.content_snapshot - The request's content snapshot.
 * @property {Object} data.meta - The request's metadata.
 * @property {Object.<string, string>} data.meta.signs - The request's
 * 		signatures.
 * */

'use strict';

var utils = require('../shared/utils');

var privateData = new WeakMap();

/**
 * Initializes a new request with the given snapshot,
 * signatures and parameters.
 *
 * <code>SignableRequest</code> objects are not to be created directly using
 * the <code>new</code> keyword.
 *
 * @class
 *
 * @param {Buffer} snapshot - The snapshot of request.
 * @param {Object} signatures - Object representing a mapping from signer ids
 * 		to the signatures.
 * @param {Object} params - Request parameters.
 * @param {string} [validationToken] - Optional card's identity validation
 * 		token. Required when publishing\revoking cards with 'global' scope.
 *
 * @constructor
 * */
function SignableRequest (snapshot, signatures, params, validationToken) {
	privateData.set(this, {
		snapshot: snapshot,
		signatures: signatures,
		validationToken: validationToken
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
 * @returns {SignedRequestBody}
 * */
SignableRequest.prototype.getRequestBody = function () {
	var privateFields = privateData.get(this);
	var body = {
		content_snapshot: utils.bufferToBase64(privateFields.snapshot),
		meta: {
			signs: utils.mapValues(privateFields.signatures,
									utils.bufferToBase64)
		}
	};

	if (privateFields.validationToken) {
		body.meta.validation = {
			token: privateFields.validationToken
		};
	}

	return body;
};

/**
 * Gets the identity validation token to be passed with the request.
 * Used when publishing\revoking globally-scoped cards.
 *
 * @returns {string}
 */
SignableRequest.prototype.getValidationToken = function () {
	return privateData.get(this).validationToken;
};

/**
 * Sets the identity validation token to be passed with the request.
 * Used when publishing\revoking globally-scoped cards.
 *
 * @param {string} validationToken - The validation token.
 */
SignableRequest.prototype.setValidationToken = function (validationToken) {
	privateData.get(this).validationToken = validationToken;
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
 * @param {Object} params - The request parameters.
 * @param {string} [validationToken] - Optional identity validation token.
 * 		Required for publishing\revoking cards with 'global' scope.
 * @returns {SignableRequest} - The newly created request.
 * */
SignableRequest.create = function createSignableRequest (
	params, validationToken) {
	var json = JSON.stringify(params);
	var snapshot = utils.stringToBuffer(json);
	var signatures = Object.create(null);

	return new SignableRequest(snapshot, signatures, params, validationToken);
};

/**
 * Creates a new request instance from the previously exported request.
 * The new request has the exact same snapshot as the exported one.
 *
 * returns {SignableRequest} - The imported request.
 * */
SignableRequest.import = function importSignableRequest (exportedRequest) {
	var requestJSON = utils.base64ToString(exportedRequest);
	var requestModel = JSON.parse(requestJSON);
	var snapshot = utils.base64ToBuffer(requestModel.content_snapshot);
	var signatures = utils.mapValues(
		requestModel.meta.signs,
		utils.base64ToBuffer);
	var params = JSON.parse(snapshot.toString('utf8'));
	var token = requestModel.meta.validation &&
		requestModel.meta.validation.token;

	return new SignableRequest(snapshot, signatures, params, token);
};

module.exports = SignableRequest;
