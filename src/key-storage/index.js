'use strict';

var fileStorageAdapter = require('./adapters/file-storage');
var DefaultKeyStorage = require('./default-key-storage');

module.exports = function initDefaultKeyStorage (options) {
	return new DefaultKeyStorage(fileStorageAdapter(options));
};
