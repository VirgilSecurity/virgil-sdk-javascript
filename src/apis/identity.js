'use strict';

var axios = require('axios');
var errors = require('./identity-errors');
var handleError = require('../shared/error-handler')(errors);

/**
 * @typedef {Object} IdentityValidationResult
 * @property {boolean} isValid - Indicates whether identity validation
 * 		succeeded.
 * @property {string|null} error - In case of validation failure, contains
 * 		a message describing the reason, is null otherwise.
 * */

/**
 * @typedef {Object} HTTPResponse
 * @property {any} data - Response data provided by server.
 * @property {number} status - HTTP status code from the response.
 * @property {string} statusText - Textual HTTP status message from the
 * 		response.
 * @property {Object} headers - The headers that the server responded with.
 * @property {Object} config - The config object provided for the request.
 * */

module.exports = function createIdentityClient (options) {
	options = typeof options === 'object' ? options : {};

	var client = axios.create({
		baseURL: options.identityBaseUrl ||
		'https://identity.virgilsecurity.com/v1'
	});

	return {
		/**
		 * Initiates a process of identity verification. Returns the
		 * identifier of the process to be presented at confirmation stage.
		 *
		 * @param {Object} data - The method parameters.
		 * @param {string} data.value - The identity to verify.
		 * @param {string} data.type - The type of identity to verify.
		 * @param {Object.<string, string>} [data.extra_fields] - Optional
		 * 		hash with custom parameters that will be passed in
		 * 		confirmation message.
		 *
		 * @returns {Promise.<HTTPResponse>}
		 * */
		verify: function (data) {
			return client.post('/verify', data).catch(handleError);
		},

		/**
		 * Confirms the ownership of the previously verified identity by
		 * presenting the confirmation code sent to the identity.
		 *
		 * @param {Object} data - The method parameters.
		 * @param {string} data.action_id - The action id returned by the
		 * 		{@link verify} method.
		 * @param {string} data.confirmation_code - The code sent in the
		 * 		confirmation message to the identity being verified.
		 * @param {Object} [data.token] - Optional parameters of the
		 * 		validation token to be returned.
		 * @param {number} [data.token.time_to_live=3600] - Lifetime of the
		 * 		generated token in seconds. Default is 3600.
		 * @param {number} [data.token.count_to_live=1] - Number of times
		 * 		the generated token can be used. Default is 1.
		 *
		 * @returns {Promise.<HTTPResponse>}
		 * */
		confirm: function (data) {
			return client.post('/confirm', data).catch(handleError);
		},

		/**
		 * Checks whether the given identity and identity type have been
		 * verified and their ownership has been confirmed by the Virgil
		 * Identity Service.
		 *
		 * @param {Object} data - The method parameters.
		 * @param {string} data.value - The identity to validate.
		 * @param {string} data.type - The identity type to validate.
		 * @param {string} data.validation_token - The validation token.
		 *
		 * @returns {Promise.<IdentityValidationResult>}
		 * */
		validate: function (data) {
			return client.post('/validate', data)
				.then(function () {
					return {
						isValid: true,
						error: null
					};
				}).catch(function (error) {
					if (error.response && error.response.status === 400) {
						var code = error.response.data &&
									error.response.data.code;
						return {
							isValid: false,
							error: code ? errors[code] : 'Bad Request'
						};
					}

					handleError(error);
				});
		}
	};
};
