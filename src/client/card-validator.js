/**
 * @fileoverview A factory function for Virgil Card validator objects.
 *
 * Card validator objects maintain a mapping of signer ids to public keys
 * internally to perform signatures verification. By default only the
 * Virgil Cards Service's and the card's owner signatures are verified.
 * Use {code: addVerifier} method to add id of the signer (and its public key)
 * that you want to verify the signatures of.
 * */

'use strict';

var CardServiceVerifierInfo =
	require('./card-verifiers/card-service-verifier-info');
var utils = require('../shared/utils.js');
var assert = utils.assert;
var base64Decode = utils.base64Decode;
var isBuffer = utils.isBuffer;
var isString = utils.isString;


/**
 * The factory function used to create <code>CardValidator</code> instances.
 * Card validator is responsible for verifying integrity of the Virgil
 * Cards returned by the API methods.
 *
 * <code>CardValidator</code> objects are not to be created directly using
 * the <code>new</code> keyword.
 *
 * @example
 *
 * var validator = virgil.cardValidator(virgil.crypto);
 *
 * @param {*} crypto - An object providing implementation of cryptographic
 * 		operations.
 * @param {(CardVerifierInfo|CardVerifierInfo[])} [cardVerifiers] -
 * 		In order to ensure integrity the Virgil Cards are signed by other
 * 		Virgil Cards. This parameter specifies a mapping of Virgil Card id
 * 		to Virgil Card public keys of Virgil Cards whose signatures must
 * 		be verified by this validator. Optional. Defaults to the
 * 		Virgil Cards Service's info.
 *
 * @constructs CardValidator
 * */
function cardValidator (crypto, cardVerifiers) {

	var verifiers = Object.create(null);

	if (!cardVerifiers) {
		cardVerifiers = [CardServiceVerifierInfo];
	}

	cardVerifiers = utils.toArray(cardVerifiers);
	cardVerifiers.forEach(function (verifier) {
		addVerifier(verifier.cardId, verifier.publicKeyData);
	});

	return /** @lends CardValidator */ {
		addVerifier: addVerifier,
		validate: validate,
		canValidate: canValidate
	};

	/**
	 * Adds the signer id - public key mapping to the collection of
	 * public keys used to verify signatures of the cards.
	 *
	 * @param {string} signerId - Id of the card the public key is
	 * 			associated with.
	 * @param {Buffer|string} publicKey - The public key to use to verify
	 * 			cards' signatures corresponding to the given signer id as a
	 * 			{Buffer} or a base64-encoded {string}.
	 * */
	function addVerifier (signerId, publicKey) {
		assert(isString(signerId),
			'addVerifier expects signerId argument to be passed as ' +
			'a string. Got ' + typeof signerId);

		assert(isBuffer(publicKey) || isString(publicKey),
			'addVerifier expects publicKey argument to be passed as a Buffer' +
			' or a base64-encoded string. Got ' + typeof publicKey);

		publicKey = isString(publicKey)
			? base64Decode(publicKey) : publicKey;

		verifiers[signerId] = crypto.importPublicKey(publicKey);
	}

	/**
	 * Validates the signatures of the card. Returns {code: true} if all
	 * of the signatures that this validator checks are valid, otherwise
	 * returns {code: false}.
	 *
	 * @param {CardModel} card - The card to verify the signatures of.
	 * @return {boolean}
	 * */
	function validate (card) {
		if (!canValidate(card)) {
			return true;
		}

		var fingerprint = crypto.calculateFingerprint(card.snapshot);
		return verifyFingerprint(fingerprint, card) &&
				verifyOwnSignature(fingerprint, card) &&
				verifySignatures(fingerprint, card);
	}

	/**
	 * Returns a boolean indicating whether the given card can be validated
	 * by this validator.
	 *
	 * @param {CardModel} card - The card to check.
	 * @returns {boolean} - True if the card can be validated, otherwise False.
	 * */
	function canValidate (card) {
		if (!card) {
			return false;
		}

		// ignore legacy cards
		return card.version !== '3.0';
	}

	/**
	 * Verifies that the fingerprint of the card matches it's id, which proves
	 * that the content snapshot of the card is the same as it was at the time
	 * of card creation.
	 * @private
	 *
	 * @param {Buffer} fingerprint - The fingerprint
	 * @param {CardModel} card - The card.
	 *
	 * @return {boolean}
	 * */
	function verifyFingerprint (fingerprint, card) {
		var expectedId = fingerprint.toString('hex');
		return card.id === expectedId;
	}

	/**
	 * Verifies the signature made with the card's corresponding private key.
	 * @private
	 *
	 * @param {Buffer} fingerprint - The fingerprint
	 * @param {CardModel} card - The card.
	 *
	 * @return {boolean}
	 * */
	function verifyOwnSignature (fingerprint, card) {
		var sign = card.signatures[card.id];
		if (!sign) {
			return false;
		}
		var publicKey = crypto.importPublicKey(card.publicKey);
		return crypto.verify(fingerprint, sign, publicKey);
	}

	/**
	 * Verifies the signatures of the signers explicitly added to this
	 * validator via {code: addVerifier} method.
	 * @private
	 *
	 * @param {Buffer} fingerprint - The fingerprint
	 * @param {CardModel} card - The card.
	 *
	 * @return {boolean}
	 * */
	function verifySignatures (fingerprint, card) {
		return Object.keys(verifiers)
			.every(function (signerId) {
				var sign = card.signatures[signerId];
				if (!sign) {
					return false;
				}
				var publicKey = verifiers[signerId];
				return crypto.verify(fingerprint, sign, publicKey);
			})
	}
}

module.exports = cardValidator;
