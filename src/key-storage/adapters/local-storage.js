'use strict';

var localforage = require('localforage');
var toArrayBuffer = require('to-arraybuffer');
var utils = require('../../shared/utils');

var defaults = {
	driver: localforage.INDEXEDDB
};

/**
 *  Creates a storage backend that uses file system for persistence.
 *  @param {(Object|string)} config - The storage configuration options.
 *  		If config is a string, then it specifies the storage folder path.
 *  @param {string} [config.dir='.'] - Storage directory path. Can be relative
 *  		path, in which case it is considered relative to current working
 *  		directory.
 *  @param {string} [config.encoding] - The encoding that the data read and
 *  		written to file system is encoded with. If not specified - raw
 *  		Buffers will be read and written.
 * */
function browserStorage (config) {
	config = utils.assign({}, defaults, config || {});

	var store = localforage.createInstance(config);

	return /** @implements {StorageAdapter} */ {

		/**
		 * Persist the value under the key.
		 * @param {string} key - The key.
		 * @param {*} value - The value.
         * @returns {Promise}
         */
		save: function (key, value) {
			if (utils.isBuffer(value)) {
				// localforage serializes Buffer as Uint8Array which cannot
				// be converted back to Buffer upon deserialization, so we
				// store is as ArrayBuffer and do the conversion manually
				value = toArrayBuffer(value);
			}
			return store.setItem(key, value);
		},

		/**
		 * Retrieve the value stored under the key.
		 * @param {string} key - The key.
		 * @returns {Promise.<*>}
         */
		load: function (key) {
			return store.getItem(key).then(function (value) {
				if (utils.isArrayBuffer(value)) {
					return utils.arrayBufferToBuffer(value);
				}

				return value;
			});
		},

		/**
		 * Remove a value stored under the key.
		 * @param key - The key.
         * @returns {Promise}
         */
		remove: function (key) {
			return store.removeItem(key);
		}
	};
}

module.exports = browserStorage;
