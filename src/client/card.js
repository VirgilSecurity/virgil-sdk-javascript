/**
 * @fileoverview A class representing a Virgil Card.
 * */

'use strict';

var utils = require('../shared/utils');

/**
 * @classdesc Represents a Virgil Card.
 * @class
 * @name Card
 * @property {Buffer} publicKey - The public key material of the card.
 * @property {string} identity - The card's identity.
 * @property {string} identity_type - The card's identity type.
 * @property {string} scope - The card's scope.
 * @property {Object} [data] - Optional user data associated with the card.
 * @property {string} [device] - Optional identifier of the device associated
 * 			with the card.
 * @property {string} [deviceName] - Optional name of the device
 * 			associated with the card.
 * @property {Date} createdAt - The date and time the card was created on.
 * @property {string} version - Version of the Virgil Service that generated
 * 			the card.
 * @property {Object.<{string: Buffer}>} signatures - The card's signatures as
 * the mapping
 * 			of the signer ids to the signatures.
 * */

/**
 * Creates a new Card instance from the given parameters.
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

	this.id = params.id;
	this.snapshot = snapshot;
	this.publicKey = utils.base64ToBuffer(props.public_key);
	this.identity = props.identity;
	this.identityType = props.identity_type;
	this.scope = props.scope;
	this.data = props.data;
	this.createdAt = new Date(meta.created_at);
	this.version = meta.card_version;
	this.signatures = meta.signs;
	if (props.info) {
		this.device = props.info.device;
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
 * @param {Object} {exportedCard} - The DTO as returned by Card#export method.
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
