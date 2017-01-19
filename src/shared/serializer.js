'use strict';

/**
 * @fileoverview Helper functions for serializing byte arrays (Buffers)
 * to base64 strings and vice versa.
 *
 * */

var stringToBuffer = require('../shared/utils').stringToBuffer;

/**
 * Transforms the {code: content_snapshot} and {code: meta.signs} of the given
 * signed content from {code: Buffer} objects to base64-encoded strings.
 *
 * @param {Object} content: The signed content to transform.
 *
 * @returns {Object}: The signed content transformed.
 * */
function serializeSignedContent (content) {
	// transform signatures from Buffers to base64 strings
	var originalSigns = content.meta.signs;
	var transformedSigns = {};
	Object.keys(originalSigns).forEach(function (key) {
		transformedSigns[key] = originalSigns[key].toString('base64');
	});
	content.meta.signs = transformedSigns;

	// transform content snapshot from Buffer to base64 string
	content.content_snapshot = content.content_snapshot.toString('base64');

	return content;
}

/**
 * Transforms the {code: content_snapshot} and {code: meta.signs} of the given
 * signed content from base64-encoded strings to {code: Buffer} objects.
 *
 * @param {Object} content: The signed content to transform.
 *
 * @returns {Object}: The signed content transformed.
 * */
function deserializeSignedContent (content) {
	var signs = content.meta.signs;

	// transform signatures from base64 strings to Buffers
	Object.keys(signs).forEach(function (key) {
		signs[key] = stringToBuffer(signs[key], 'base64');
	});

	content.content_snapshot = stringToBuffer(content.content_snapshot, 'base64');
	return content;
}

module.exports = {
	serializeSignedContent,
	deserializeSignedContent
};
