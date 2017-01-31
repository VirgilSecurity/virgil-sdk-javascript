'use strict';

/**
 * @fileoverview Class representing a handle to a cryptographic key.
 * */

/**
 * Creates a cryptographic key handle.
 *
 * @param type {string}: The type of the key (public or private).
 *
 * @constructor
 * */
function CryptoKeyHandle (type) {
	this.type = type;
}

module.exports = CryptoKeyHandle;
