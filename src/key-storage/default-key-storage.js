'use strict';

var utils = require('../shared/utils');

/**
 * A class providing default implementation of cryptographic key storage
 * container.
 *
 * @param {StorageAdapter} adapter
 * @implements {KeyStorage}
 * @constructor
 */
function DefaultKeyStorage (adapter) {
	this.adapter = adapter;
}

DefaultKeyStorage.prototype.store = function(name, privateKeyData) {
	return this.exists(name)
		.then(function (exists) {
			if (exists) {
				throw utils.createError('Private key named "' + name +
					'" already exists in storage.');
			}

			return this.adapter.save(name, privateKeyData);
		}.bind(this))
};

DefaultKeyStorage.prototype.load = function(name) {
	return this.exists(name)
		.then(function (exists) {
			if (!exists) {
				throw utils.createError('Private key named "' + name +
					'" does not exist in storage.');
			}

			return this.adapter.load(name);
		}.bind(this));
};

DefaultKeyStorage.prototype.exists = function(name) {
	return this.adapter.exists(name);
};

DefaultKeyStorage.prototype.delete = function(name) {
	return this.exists(name)
		.then(function (exists) {
			if (!exists) {
				throw utils.createError('Private key named "' + name +
					'" does not exist in storage.')
			}

			return this.adapter.remove(name);
		}.bind(this))
};

module.exports = DefaultKeyStorage;
