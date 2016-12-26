var assign = require('../shared/utils.js').assign;

function cardValidator (crypto) {

	var SERVICE_CARD_ID = '3e29d43373348cfb373b7eae189214dc01d7237765e572db685839b64adca853';
	var SERVICE_PUBLIC_KEY = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQVlSNTAxa1YxdFVuZTJ1T2RrdzRrRXJSUmJKcmMyU3lhejVWMWZ1RytyVnM9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=';

	var verifiers = Object.create(null);

	addVerifier(SERVICE_CARD_ID, new Buffer(SERVICE_PUBLIC_KEY, 'base64'));

	return {
		addVerifier: addVerifier,
		validate: validate
	};

	function addVerifier (verifierId, publicKey) {
		if (typeof verifierId !== 'string') {
			throw new Error('"verifierId" must be a string.');
		}

		if (!Buffer.isBuffer(publicKey)) {
			throw new Error('"publicKey" must be a Buffer');
		}

		verifiers[verifierId] = crypto.importPublicKey(publicKey);
	}

	function validate (card) {
		if (card.version === '3.0') {
			return true;
		}

		var fingerprint = crypto.calculateFingerprint(card.snapshot);
		var fingerprintHEX = fingerprint.toString('hex');

		if (fingerprintHEX !== card.id) {
			return false;
		}

		var allVerifiers = assign({}, verifiers);
		allVerifiers[fingerprintHEX] = crypto.importPublicKey(card.publicKey);

		return Object.keys(allVerifiers).every(function (verifierId) {
			var sign   = card.signatures[verifierId],
				pubkey = allVerifiers[verifierId];
			if (!sign) {
				return false;
			}

			return crypto.verify(fingerprint, sign, pubkey);
		});
	}
}

module.exports = cardValidator;
