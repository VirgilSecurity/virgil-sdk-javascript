'use strict';

var utils = require('../shared/utils');

/**
 * Takes a snapshot of content of the object.
 * @param {Object} obj - The object to take snapshot of.
 * @return {Buffer}
 */
module.exports = function (obj) {
	var json = JSON.stringify(obj);
	return utils.stringToBuffer(json);
};
