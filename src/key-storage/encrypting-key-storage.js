'use strict';

/**
 * @fileoverview Default implementation of {@link KeyStorage}.
 * */

var inherits = require('../shared/utils').inherits;
var KeyStorage = require('./key-storage');

/**
 *	Class to provide encrypted cryptographic keys storage container.
 *	@param {!StorageMechanism} storage Persistent storage mechanism.
 *	@param {Object} crypto Cryptographic functionality provider.
 *	@extends {KeyStorage}
 *	@constructor
 * */
function EncryptingKeyStorage (storage, crypto) {
	this._storage = storage;
	this._crypto = crypto;
}

inherits(EncryptingKeyStorage, KeyStorage);

/** @override */
EncryptingKeyStorage.prototype.save = function (key, name, password) {
	this._storage.set(name, this._encrypt(key, password));
};

/** @override */
EncryptingKeyStorage.prototype.load = function (name, password) {
	var storedObj = this._storage.get(name);
	if (storedObj) {
		return this._decrypt(storedObj, password);
	}

	return null;
};

/** @override */
EncryptingKeyStorage.prototype.remove = function (name) {
	this._storage.remove(name);
};

/**
 * Encrypts the key with password.
 * @param {PrivateKeyHandle} key Key to encrypt
 * @param {string} password Password to use for encryption.
 * @private
 * */
EncryptingKeyStorage.prototype._encrypt = function (key, password) {
	var encryptedKeyBuf = this._crypto.exportPrivateKey(key, password);
	return encryptedKeyBuf.toString('base64');
};

/**
 * Decrypts the data with password.
 * @param {PrivateKeyHandle} cipherText Encrypted text.
 * @param {string} password Password to use for decryption.
 * @private
 * */
EncryptingKeyStorage.prototype._decrypt = function (cipherText, password) {
	var encryptedKeyBuf = Buffer.from(cipherText, 'base64');
	return this._crypto.importPrivateKey(encryptedKeyBuf, password);
};

module.exports = EncryptingKeyStorage;


