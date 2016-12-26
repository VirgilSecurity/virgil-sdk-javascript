'use strict';

var utils = require('../shared/utils');

function VirgilError (msg) {

	// Try to make sure there is stack trace.
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, VirgilError);
	} else {
		var stack = new Error().stack;
		if (stack) {
			this.stack = stack;
		}
	}

	if (msg) {
		this.message = String(msg);
	}
}

utils.inherits(VirgilError, Error);

VirgilError.prototype.name = 'VirgilError';

module.exports = VirgilError;
