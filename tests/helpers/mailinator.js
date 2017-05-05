'use strict';

var assert = require('assert');
var axios = require('axios');

assert(process.env.VIRGIL_MAILINATOR_TOKEN, 'env.VIRGIL_MAILINATOR_TOKEN is required');

module.exports = function mailinator(opts) {
	opts = opts || {};
	var baseURL = opts.apiURL || "https://api.mailinator.com/api/";
	var token = process.env.VIRGIL_MAILINATOR_TOKEN;

	var http = axios.create({
		baseURL: baseURL
	});

	function getMessages(to) {
		return http.get('/inbox', {
			params: {
				to: to,
				token: token
			}
		}).then(function (response) {
			return response.data.messages;
		});
	}

	function readMessage(messageId) {
		return http.get('/email', {
			params: {
				id: messageId,
				token: token
			}
		}).then(function (response) {
			return response.data;
		})
	}

	function deleteMessage(messageId) {
		return http.get('/delete', {
			params: {
				id: messageId,
				token: token
			}
		}).then(function (response) {
			return response.data;
		});
	}

	return {
		getMessages: getMessages,
		readMessage: readMessage,
		deleteMessage: deleteMessage
	};
};
