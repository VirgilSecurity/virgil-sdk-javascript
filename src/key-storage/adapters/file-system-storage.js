'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var utils = require('../../shared/utils');

var defaults = {
	dir: process.cwd(),
	encoding: null
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
function fileSystemStorage (config) {

	config = utils.isString(config) ?
		utils.assign({}, defaults, { dir: config }) :
		utils.assign({}, defaults, config);

	config.dir = resolveDir(config.dir);

	init();

	return /** @implements {StorageAdapter} */ {
		save: save,
		load: load,
		remove: remove
	};

	/**
	 * Initializes internal storage with data from file system.
	 * @private
	 * */
	function init () {
		var dir = config.dir;
		mkdirp.sync(dir);
	}

	/**
	 * Saves the value to a file using key as file name.
	 * @param {string} key - Key to save.
	 * @param {(Buffer|string)} value - Value to save. If value is a string,
	 * 		the encoding specified in config is assumed.
	 * @private
	 * */
	function save (key, value) {
		return new Promise(function (resolve, reject) {
			var file = resolveFilePath(key);
			fs.writeFile(file, value, config.encoding, function (err) {
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		});
	}


	/**
	 * Returns the value stored under key.
	 * @param {string} key - The key to retrieve
	 * @return {Promise.<(Buffer|string)>} A Promise that will be resolved
	 * 		with the stored value. If an encoding was specified in the config,
	 * 		the resolved value is a string in the given encoding.
	 * */
	function load (key) {
		return new Promise(function (resolve, reject) {
			var file = resolveFilePath(key);
			fs.readFile(file, config.encoding, function (err, data) {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(null);
					} else {
						reject(err);
					}
					return;
				}

				resolve(data);
			});
		});
	}

	/**
	 * Removes a value by key.
	 * @param {string} key - Key to remove.
	 * @returns {Promise.<boolean>} A Promise that is resolved with a boolean
	 * indicating whether a value has been removed.
	 * */
	function remove (key) {
		return new Promise(function (resolve, reject) {
			var file = resolveFilePath(key);
			fs.unlink(file, function (err) {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(false);
					} else {
						reject(err);
					}
					return;
				}

				resolve(true);
			});
		});
	}

	/**
	 * Resolves the absolute path to storage directory. If dir is a relative
	 * path it is considered relative to the current working directory.
	 *
	 * @param {string} dir - The path to storage directory.
	 * @returns {string} Absolute path to storage directory.
	 * @private
	 * */
	function resolveDir (dir) {
		dir = path.normalize(dir);
		if (path.isAbsolute(dir)) {
			return dir;
		}

		return path.join(process.cwd(), dir);
	}

	/**
	 * Resolves file path from storage key.
	 * @param {string} key - The storage key.
	 * @returns {string} File path
	 * */
	function resolveFilePath (key) {
		var safeKey = md5(key);
		return path.join(config.dir, safeKey);
	}
}

/**
 * Helper function to generate md5 hash from string.
 * @param {string} data
 * @return {string} Hash as HEX-encoded string.
 * */
var md5 = function (data) {
	return crypto.createHash('md5').update(data).digest('hex');
};

module.exports = fileSystemStorage;
