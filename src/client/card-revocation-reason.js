'use strict';

/**
 * Enumeration of possible reasons for Virgil Card revocation.
 * @readonly
 * @enum {string}
 * */
var RevocationReason = {
	COMPROMISED: 'compromised',
	UNSPECIFIED: 'unspecified'
};

module.exports = RevocationReason;
