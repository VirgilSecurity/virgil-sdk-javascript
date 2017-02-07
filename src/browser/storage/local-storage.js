'use strict';

/**
 * @fileoverview Implements a storage mechanism using localStorage.
 * */

var inherits = require('../../shared/utils').inherits;
var StorageMechanism = require('../../shared/storage-mechanism');


/**
 * Creates a storage mechanism that uses localStorage for persistence.
 * @param {string} key Key under which to store all the data in localStorage.
 * @constructor
 * @extends {StorageMechanism}
 * */
function LocalStorage (key) {
	this._storage = null;
	this._storageKey = key;

	// TODO check availability
	this._init();
}

inherits(LocalStorage, StorageMechanism);

/**
 * Initializes internal storage with data from localStorage.
 * @private
 * */
LocalStorage.prototype._init = function () {
	this._storage = localStorage.getItem(this._storageKey) || Object.create(null);
};

/** @override */
LocalStorage.prototype.set = function (key, value) {
	this._storage[key] = value;
	this._persist();
};

/** @override */
LocalStorage.prototype.get = function (key) {
	if (key in this._storage) {
		return this._storage[key];
	}
	return null;
};

/** @override */
LocalStorage.prototype.remove = function (key) {
	delete this._storage[key];
	this._persist();
};

/**
 * Saves the data in internal storage into localStorage.
 * @private
 * */
LocalStorage.prototype._persist = function () {
	localStorage.setItem(this._storageKey, JSON.stringify(this._storage));
};

module.exports = LocalStorage;

