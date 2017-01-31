/**
 * @fileoverview A class representing a Virgil Card.
 * */

'use strict';

var utils = require('../shared/utils');


/**
 * Creates a new Card instance with the given id, content snapshot
 * and metadata.
 *
 * @param {Object} params - The Card parameters.
 * @param {string} params.id - Id of the card.
 * @param {Buffer} params.content_snapshot - The card's content snapshot.
 * @param {Object} params.meta - The card's metadata.
 *
 * @constructor
 * */
function Card(params) {
	var snapshot = params.content_snapshot;
	var meta = params.meta;
	var props = JSON.parse(utils.bufferToString(snapshot));

	/**
	 * @type {string} - Id of the card.
	 * */
	this.id = params.id;
	/**
	 * @type {Buffer} - The card's immutable content snapshot.
	 * */
	this.snapshot = snapshot;
	/**
	 * @type {Buffer} - The card's public key material.
	 * */
	this.publicKey = utils.base64ToBuffer(props.public_key);
	/**
	 * @type {string} - The card's identity.
	 * */
	this.identity = props.identity;
	/**
	 * @type {string} - The card's identity type.
	 * */
	this.identityType = props.identity_type;
	/**
	 * @type {Buffer} - The card's scope.
	 * */
	this.scope = props.scope;
	/**
	 * @type {Object} - The user data associated with the card.
	 * */
	this.data = props.data;
	/**
	 * @type {Date} - The date the card was created at.
	 * */
	this.createdAt = new Date(meta.created_at);
	/**
	 * @type {string} - The version of Virgil Cards Service
	 * 			that generated the card.
	 * */
	this.version = meta.card_version;
	/**
	 * @type {Object} - The card's signatures as a hash with signer's ids
	 * 			as keys and the signatures as values.
	 * */
	this.signatures = meta.signs;
	if (props.info) {
		/**
		 * @type {string} - Optional identifier of the card's
		 * associated device.
		 * */
		this.device = props.info.device;
		/** @type {string} - Optional name of the card's associated device. */
		this.deviceName = props.info.device_name;
	}
}

/**
 * Converts the Card instance into a transferable format (DTO).
 *
 * returns {Object} - A DTO representing a card.
 * */
Card.prototype.export = function () {
	return  {
		id: this.id,
		content_snapshot: utils.bufferToBase64(this.snapshot),
		meta: {
			created_at: this.createdAt.toISOString(),
			card_version: this.version,
			signs: utils.mapValues(this.signatures, utils.bufferToBase64)
		}
	};
};

/**
 * Restores a Card instance from the DTO representing a card.
 *
 * @param {Object} exportedCard - The DTO as returned by Card#export method.
 * returns {Card} - The imported Card.
 * */
Card.import = function (exportedCard) {
	var contentSnapshot = utils.base64ToBuffer(exportedCard.content_snapshot);
	var signs = utils.mapValues(exportedCard.meta.signs, utils.base64ToBuffer);
	var params = {
		id: exportedCard.id,
		content_snapshot: contentSnapshot,
		meta: utils.assign({}, exportedCard.meta, { signs: signs })
	};

	return new Card(params);
};

module.exports = Card;
