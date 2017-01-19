/**
 * @fileoverview A class representing a Virgil Card.
 * */

'use strict';

var serializer = require('../shared/serializer');
var stringToBuffer = require('../shared/utils').stringToBuffer;

/**
 * Creates a new Card instance from the given parameters.
 *
 * @param {Object} params - The Card parameters.
 * @param {string} params.id - Id of the card.
 * @param {Buffer} params.content_snapshot - The card's content snapshot.
 * @param {string} params.public_key - The public key material of the card
 * 			as base64-encoded string.
 * @param {string} params.identity - The card's identity.
 * @param {string} params.identity_type - The card's identity type.
 * @param {string} params.scope - The card's scope.
 * @param {Object} [params.data] - Optional user data associated with the card.
 * @param {Object} [params.info] - Optional information about the device the
 * 			card is associated with.
 * @param {string} [params.info.device] - Optional identifier of the device
 * 			associated with the card.
 * @param {string} [params.info.device_name] - Optional name of the device
 * 			associated with the card.
 * @param {string} params.created_at - The date and time the card was created on
 * 			in ISO-8601 format.
 * @param {string} params.card_version - Version of the Virgil Service that
 * 			generated the card.
 * @param {Object} params.signatures - The card's signatures as the mapping
 * 			of the signer ids to the signatures.
 *
 * @constructor
 * */
function Card(params) {
	this.id = params.id;
	this.snapshot = params.content_snapshot;
	this.publicKey = stringToBuffer(params.public_key, 'base64');
	this.identity = params.identity;
	this.identityType = params.identity_type;
	this.scope = params.scope;
	this.data = params.data;
	this.createdAt = new Date(params.created_at);
	this.version = params.card_version;
	this.signatures = params.signatures;
	if (params.info) {
		this.device = params.info.device;
		this.deviceName = params.info.device_name;
	}
}

/**
 * Converts the Card instance into a transferable format (DTO).
 *
 * returns {Object} - A DTO representing a card.
 * */
Card.prototype.export = function () {
	var cardDTO = {
		id: this.id,
		content_snapshot: this.snapshot,
		meta: {
			created_at: this.createdAt.toISOString(),
			card_version: this.version,
			signs: this.signatures
		}
	};

	return serializer.serializeSignedContent(cardDTO);
};

/**
 * Restores a Card instance from the DTO representing a card.
 *
 * @param {Object} {exportedCard} - The DTO as returned by Card#export method.
 * returns {Card} - The imported Card.
 * */
Card.import = function (exportedCard) {
	var cardDTO = serializer.deserializeSignedContent(exportedCard);
	var params = JSON.parse(cardDTO.content_snapshot.toString('utf8'));
	params.id = cardDTO.id;
	params.content_snapshot = cardDTO.content_snapshot;
	params.created_at = cardDTO.meta.created_at;
	params.card_version = cardDTO.meta.card_version;
	params.signatures = cardDTO.meta.signs;

	return new Card(params);
};

module.exports = Card;
