// Create verify response method with own context to store service public key
// Used for all services which need response verification
module.exports = function createVerifyResponseMethod (appId, cardsClient, crypto, publicKey) {
	// Emulate card object structure
	var serviceCard = publicKey ? { public_key: { public_key: publicKey }} : null;

	return {
		verifyResponse: verifyResponse,
		fetchServiceCard: fetchServiceCard
	};

	function verifyResponse (res) {
		return fetchServiceCard()
			.then(function (card) {
				var responseId = res.headers['x-virgil-response-id'];
				var signBase64 = res.headers['x-virgil-response-sign'];

				if (!responseId || !signBase64) {
					throw new Error('Invalid response headers');
				}

				var sign = new Buffer(signBase64, 'base64');
				var signedData = responseId + res.data;

				if (!crypto.verify(signedData, card.public_key.public_key, sign)) {
					throw new Error('Response verification failed');
				}
			});
	}

	function fetchServiceCard () {
		if (serviceCard) {
			return new Promise(function(resolve) {
				resolve(serviceCard);
			});
		} else {
			return cardsClient.searchGlobal({
				value: appId,
				type: crypto.IdentityTypesEnum.application,
				ignore_verification: true
			}).then(function searchVirgilCard (cards) {
				if (!cards || !cards.length) {
					throw new Error('Service card is not found');
				}

				return serviceCard = cards[0];
			});
		}
	}
}
