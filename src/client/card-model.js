/**
 * @fileoverview A class representing a Virgil Card.
 * */

'use strict';

var utils = require('../shared/utils');
var parseSnapshot = require('../helpers/parse-snapshot');

/**
 * Creates a new CardModel instance with the given id, content snapshot
 * and metadata.
 *
 * @param {Buffer} snapshot - The card's content snapshot.
 * @param {Object} meta - The card's metadata.
 * @param {Object} props - The card's properties.
 *
 * @constructor
 * */
function CardModel(snapshot, meta, props) {
	/** @type {string} - Id of the card. */
	this.id = props.id;

	/** @type {Buffer} - The card's immutable content snapshot. */
	this.snapshot = snapshot;

	/** @type {Buffer} - The card's public key material. */
	this.publicKey = utils.base64Decode(props.public_key);

	/** @type {string} - The card's identity. */
	this.identity = props.identity;

	/** @type {string} - The card's identity type. */
	this.identityType = props.identity_type;

	/** @type {string} - The card's scope. */
	this.scope = props.scope;

	/**
	 * @type {Object.<string, string>} - The user data associated with
	 * the card.
	 * */
	this.data = props.data;

	/** @type {Date} - The date the card was created at. */
	this.createdAt = meta.created_at && new Date(meta.created_at);

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
 * Converts the CardModel instance into a transferable format (DTO).
 *
 * @returns {Object} - A DTO representing a card.
 * */
CardModel.prototype.export = function () {
	return  {
		id: this.id,
		content_snapshot: utils.base64Encode(this.snapshot),
		meta: {
			created_at: this.createdAt
				? this.createdAt.toISOString() : undefined,
			card_version: this.version,
			signs: utils.mapValues(this.signatures, utils.base64Encode)
		}
	};
};

/**
 * Restores a CardModel instance from the DTO representing a card.
 *
 * @param {Object} exportedCard - The DTO as returned by Card#export method.
 * @returns {CardModel} - The imported Card.
 * */
CardModel.import = function (exportedCard) {
	var contentSnapshot = utils.base64Decode(exportedCard.content_snapshot);
	var signs = utils.mapValues(exportedCard.meta.signs, utils.base64Decode);
	var meta = utils.assign({}, exportedCard.meta, { signs: signs });
	var props = parseSnapshot(exportedCard.content_snapshot);
	props.id = exportedCard.id;

	return new CardModel(contentSnapshot, meta, props);
};

module.exports = CardModel;
