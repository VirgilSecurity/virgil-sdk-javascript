'use strict';

var test = require('tape');
var axios = require('axios');
var Promise = require('bluebird');
var createIdentityClient = require('../../src/apis/identity');

var originalAdapter = axios.defaults.adapter;

function teardown () {
	axios.defaults.adapter = originalAdapter;
}

test('uses identity url from options', function (t) {
	axios.defaults.adapter = function (config) {
		return new Promise(function (resolve) {
			resolve({
				data: { action_id: '123' },
				status: 200,
				statusText: 'OK',
				headers: {},
				config: config
			});
		});
	};

	var customIdentityURL = 'https://my-identity.com';
	var expectedURL = customIdentityURL + '/verify';
	var client = createIdentityClient({ identityBaseUrl: customIdentityURL });
	client.verify({ value: 'identity', type: 'email' }).then(function (res) {
		t.equal(res.config.url, expectedURL, 'url from options is set');
		t.end();

		teardown();
	});
});

test('transform validation exception into validation result', function (t) {
	axios.defaults.adapter = function (config) {
		return new Promise(function (_, reject) {
			reject({
				response: {
					data: {code: '40170'},
					status: 400,
					statusText: 'Bad Request',
					headers: {},
					config: config
				},
				config: config
			});
		});
	};

	var expectedResult = {
		isValid: false,
		error: 'Identity\'s token parameter is invalid'
	};

	var client = createIdentityClient();
	client.validate({
		value: 'identity',
		type: 'email',
		validationToken: 'abc123'
	}).then(function (res) {
		t.deepEqual(res, expectedResult, 'returns validation result');
		t.end();

		teardown();
	}).catch(function () {
		t.fail('must not throw exception on validation failure');

		teardown();
	});
});
