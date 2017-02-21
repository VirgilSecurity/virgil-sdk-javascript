'use strict';

var path = require('path');
var fs = require('fs');
var rmdir = require('rimraf');
var runStorageAdapterTestSuite =
	require('../common/storage-adapter-test-runner');

var fileSystemStorage =
	require('../../../src/key-storage/file-system-storage');

var TEST_DIR = path.join(__dirname, '/fs-storage');


function setup () {
	return fileSystemStorage({
		dir: TEST_DIR,
		encoding: 'utf8'
	});
}

function teardown (done) {
	rmdir(TEST_DIR, done);
}

runStorageAdapterTestSuite(setup, teardown);
