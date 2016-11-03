var parseJSON = require('../utils/parse-json');

module.exports = function parseCardResponse(res) {
	var contentSnapshot = new Buffer(res.content_snapshot, 'base64');
	var signaturesBase64 = res.meta.signs;
	var signatures = Object.keys(signaturesBase64)
		.reduce(function (result, signerId) {
			result[signerId] = new Buffer(signaturesBase64[signerId], 'base64');
			return result;
		}, {});

	var cardData = parseJSON(contentSnapshot.toString('utf8'));

	return {
		id: res.id,
		snapshot: contentSnapshot,
		publicKey: new Buffer(cardData.public_key, 'base64'),
		identity: cardData.identity,
		identityType: cardData.identity_type,
		scope: cardData.scope,
		data: cardData.data,
		info: cardData.info,
		createdAt: res.meta.created_at,
		version: res.meta.card_version,
		signatures: signatures
	};
};
