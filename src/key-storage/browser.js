'use strict';

var localforageStorageAdapter = require('./adapters/localforage-storage');
var DefaultKeyStorage = require('./default-key-storage');

module.exports = function initDefaultKeyStorage (options) {
	return new DefaultKeyStorage(localforageStorageAdapter(options));
};
