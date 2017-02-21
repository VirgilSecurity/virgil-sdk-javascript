'use strict';

var localforage = require('localforage');
var browserStorage = require('../../../src/key-storage/localforage-storage');
var runStorageAdapterTestSuite =
	require('../common/storage-adapter-test-runner');

var TEST_KEY = 'Virgil.TestKeyStorage';

function setup () {
	return browserStorage({
		name: TEST_KEY
	});
}

function teardown (done) {
	localforage.clear();
	done();
}

runStorageAdapterTestSuite(setup, teardown);
