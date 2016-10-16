export function cardValidator (crypto) {

	const SERVICE_CARD_ID = '3e29d43373348cfb373b7eae189214dc01d7237765e572db685839b64adca853';
	const SERVICE_PUBLIC_KEY = `LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUNvd0JRWURLMlZ3QXlFQVlSNTAx
								a1YxdFVuZTJ1T2RrdzRrRXJSUmJKcmMyU3lhejVWMWZ1RytyVnM9Ci0tLS0tRU5E
								IFBVQkxJQyBLRVktLS0tLQo=`;

	const verifiers = Object.create(null);

	addVerifier(SERVICE_CARD_ID, new Buffer(SERVICE_PUBLIC_KEY, 'base64'));

	return {
		addVerifier,
		validate
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

		const fingerprint = crypto.calculateFingerprint(card.snapshot);
		return Object.entries(verifiers).some(([verifierId, pubkey]) => {
			let sign = card.signatures[verifierId];
			if (!sign) {
				return false;
			}

			return crypto.verify(fingerprint, sign, pubkey);
		});
	}
}
