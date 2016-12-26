'use strict';

/**
 * @fileoverview Class providing storage mechanism
 * using file system for persistence.
 * */

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var E = require('core-error-predicates');
var utils = require('../../shared/utils');
var StorageMechanism = require('../../shared/storage-mechanism');

var defaults = {
	dir: process.cwd(),
	encoding: 'utf8'
};

/**
 * Helper function to generate md5 hash from string.
 * @param {string} data
 * @return {string} Hash as HEX-encoded string.
 * */
var md5 = function (data) {
	return crypto.createHash('md5').update(data).digest('hex');
};

/**
 *  Creates a storage mechanism that uses file system for persistence.
 *  @param {(Object|string)} options Configuration options. If it is a string,
 *  		then it specifies the storage folder path.
 *  @param {string=} [options.dir=.] Storage directory path.
 *  		Can be relative value. Relative path is resolved relative to
 *  		current working directory.
 *  @param {string=} [options.encoding=utf8] Encoding to use when writing and
 *  		reading files. Can be any one of those accepted by Buffer.
 * 	@constructor
 * 	@extends {StorageMechanism}
 * */
function FileSystemStorage (options) {
	options = utils.isString(options) ?
				utils.assign({}, defaults, { dir: options }) :
				utils.assign({}, defaults, options);

	options.dir = this._resolveDir(options.dir);
	this.options = options;
	this._init();
}

utils.inherits(FileSystemStorage, StorageMechanism);

/** @override */
FileSystemStorage.prototype.set = function (key, value) {
	this._persistItem(key, value);
};

/** @override */
FileSystemStorage.prototype.get = function (key) {
	return this._getItem(key);
};

/** @override */
FileSystemStorage.prototype.remove = function (key) {
	this._removeItem(key);
};

/**
 * Initializes internal storage with data from file system.
 * @private
 * */
FileSystemStorage.prototype._init = function () {
	var dir = this.options.dir;
	if (!fs.existsSync(dir)) {
		mkdirp.sync(dir);
	}
};

/**
 * Saves the value to a file using key as file name.
 * @param {string} key Key to save.
 * @param {string} value Value to save.
 * @private
 * */
FileSystemStorage.prototype._persistItem = function (key, value) {
	var file = this._resolveFilePath(key);
	console.log(this.options.encoding);
	return fs.writeFileSync(file, value, { encoding: this.options.encoding });
};

/**
 * Returns file contents by key.
 * @param {string} key Key to retrieve
 * @return {string|Buffer} {string} or {Buffer} with file contents
 * 		depending on encoding used when constructing {FileSystemStorage}.
 * */
FileSystemStorage.prototype._getItem = function (key) {
	var file = this._resolveFilePath(key);
	if (!fs.existsSync(file)) {
		return null;
	}
	try {
		return fs.readFileSync(file, { encoding: this.options.encoding });
	} catch (ex) {
		if (E.FileNotFoundError(ex)) {
			return null;
		}
		// TODO throw virgil error
		throw new Error('Virgil Key Storage:' +
			' Could not read from file system.');
	}
};

/**
 * Removes a file by key.
 * @param {string} key Key to remove.
 * @private
 * */
FileSystemStorage.prototype._removeItem = function (key) {
	var file = this._resolveFilePath(key);
	if (fs.existsSync(file)) {
		try {
			fs.unlinkSync(file);
			return true;
		} catch (ex) {
			if (E.FileNotFoundError(ex)) {
				return false;
			}
			// TODO throw virgil error
			throw new Error('Virgil Key Storage: ' +
				'Could not write to file system');
		}
	}
	return false;
};

/**
 * Resolves absolute path to storage directory. If dir is a relative path
 * it is resolved relative to the current working directory.
 *
 * @param {string} dir Path to storage directory.
 * @return {string} Absolute path to storage directory.
 * @private
 * */
FileSystemStorage.prototype._resolveDir = function (dir) {
	dir = path.normalize(dir);
	if (path.isAbsolute(dir)) {
		return dir;
	}

	return path.join(process.cwd(), dir);
};

/**
 * Resolves file path from storage key.
 * @param {string} key File name
 * @return {string} File path
 * */
FileSystemStorage.prototype._resolveFilePath = function (key) {
	var safeKey = md5(key);
	return path.join(this.options.dir, safeKey);
};


module.exports = FileSystemStorage;
