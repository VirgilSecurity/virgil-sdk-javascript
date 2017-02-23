'use strict';

var localforage = require('localforage');
var toArrayBuffer = require('to-arraybuffer');
var utils = require('../../shared/utils');

var defaults = {
	driver: localforage.INDEXEDDB
};

/**
 *  Creates a storage adapter that uses "localforage" for persistence.
 *  @param {(Object|string)} config - The storage configuration options.
 *  @param {string} [config.name='VirgilSecurityKeys'] - The storage name.
 *  @returns {StorageAdapter}
 * */
function localforageStorage (config) {
	config = utils.assign({}, defaults, config || {});

	var store = localforage.createInstance(config);

	return {

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
		 * Checks whether a there is a value for the given key in store.
		 * @param {string} key
		 * @returns {Promise.<Boolean>}
         */
		exists: function (key) {
			return store.getItem(key).then(function (value) {
				return value !== null;
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

module.exports = localforageStorage;
