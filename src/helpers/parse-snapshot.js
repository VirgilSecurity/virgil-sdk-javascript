'use strict';

var utils = require('../shared/utils');

/**
 * Returns a plain object out of content snapshot.
 * @param {string} snapshot - The object's content snapshot encoded in base64.
 * @returns {Object}
 */
module.exports = function (snapshot) {
	var json = utils.base64Decode(snapshot, 'utf8');
	return JSON.parse(json);
};
