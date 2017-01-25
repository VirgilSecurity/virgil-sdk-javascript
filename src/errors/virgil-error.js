'use strict';

/**
 * Creates a new error object.
 *
 * @param {string} [message] - Optional error message.
 * @constructor
 * */
function VirgilError (message) {
	// Try to make sure there is stack trace.
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, VirgilError);
	} else {
		var stack = new Error().stack;
		if (stack) {
			this.stack = stack;
		}
	}

	if (message) {
		this.message = String(message);
	}
}

VirgilError.prototype = Object.create(Error.prototype, {
	constructor: {
		value: VirgilError,
		enumerable: false,
		writable: true,
		configurable: true
	}
});
VirgilError.prototype.name = 'VirgilError';

module.exports = VirgilError;
