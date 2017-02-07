'use strict';

var abstractMethod = require('../shared/utils').abstractMethod;

/**
 *	Interface for cryptographic keys storage containers.
 * */
function KeyStorage () {}

/**
 * Persists the private key encrypted with password under a name.
 * @param {PrivateKeyHandle} key Key to store.
 * @param {string} name Name of key.
 * @param {string} password Password to use for encryption.
 * */
KeyStorage.prototype.save = abstractMethod;

/**
 * Gets the private key stored under name decrypting it with password.
 * @param {string} name Name of key.
 * @param {string} password Password to use for decryption.
 * @return {PrivateKeyHandle} The stored key.
 * */
KeyStorage.prototype.load = abstractMethod;

/**
 * Removes the private key stored under name from persistent storage.
 * @param {string} name Name of key to remove.
 * */
KeyStorage.prototype.remove = abstractMethod;

module.exports = KeyStorage;

