'use strict';

var utils = require('./shared/utils');
var cardManager = require('./card-manager');
var keyManager = require('./key-manager');
var virgilAPIContext = require('./virgil-api-context');

/**
 * A class representing a high-level wrapper for the Virgil SDK API.
 *
 * @param {(string|VirgilAPIConfiguration)} config - Virgil access token or
 * 		Virgil API configuration object.
 * @constructor
 */
function VirgilAPI (config) {
	utils.assert(
		utils.isUndefined(config) ||
		utils.isString(config) ||
		utils.isObject(config),
		'Virgil API expects "config" argument to be an object or a string ' +
		'if provided.');

	if (utils.isUndefined(config)) {
		config = {};
	} else if (utils.isString(config)) {
		config = { accessToken: config };
	}

	/**
	 * @type {VirgilAPIContext}
	 * @private
	 */
	this._context = virgilAPIContext(config);

	/**
	 * @type {CardManager}
     */
	this.cards = cardManager(this._context);

	/**
	 * @type {KeyManager}
     */
	this.keys = keyManager(this._context);
}

/**
 * Encrypts the given data for the given recipient card(s).
 *
 * @param {(Buffer|string)} data - The data to encrypt.
 * @param {VirgilCard[]} cards - The recipient cards.
 *
 * @returns {Buffer} - Encrypted data.
 */
VirgilAPI.prototype.encryptFor = function (data, cards) {
	utils.assert(utils.isString(data) || utils.isBuffer(data),
		'encryptFor expects data argument to be passed as a Buffer or ' +
		'a string. Got ' + typeof data);

	utils.assert(utils.isObject(cards) || utils.isArray(cards),
		'encryptFor expects cards argument to be passed as a VirgilCard ' +
		'or an array of VirgilCard objects.');

	cards = toArray(cards);

	var publicKeys = cards.map(function (card) {
		return card.publicKey;
	});

	return this._context.crypto.encrypt(data, publicKeys);
};

module.exports = VirgilAPI;
