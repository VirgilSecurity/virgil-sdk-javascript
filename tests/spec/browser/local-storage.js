'use strict';

var localforage = require('localforage');
var localStorage = require('../../../src/key-storage/adapters/browser-storage');
var runStorageAdapterTestSuite =
	require('../common/storage-adapter-test-runner');

var TEST_KEY = 'Virgil.TestKeyStorage';

function setup () {
	return localStorage({
		name: TEST_KEY
	});
}

function teardown (done) {
	localforage.clear();
	done();
}

runStorageAdapterTestSuite(setup, teardown);
