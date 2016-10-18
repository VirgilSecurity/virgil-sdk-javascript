var parseJSON = require('../utils/parse-json');
var serializer = require('./serializer');

function parseCardResponse(res) {
	var cardData = parseContentSnapshot(res.content_snapshot);
	return {
		id: res.id,
		snapshot: serializer.deserializeContentSnapshot(res.content_snapshot),
		publicKey: serializer.deserializePublicKey(cardData.public_key),
		identity: cardData.identity,
		identityType: cardData.identity_type,
		scope: cardData.scope,
		data: cardData.data,
		info: cardData.info,
		createdAt: res.meta.created_at,
		version: res.meta.card_version,
		signatures: serializer.deserializeSignatures(res.meta.signs)
	};
}

function parseContentSnapshot(snapshot) {
	return parseJSON(serializer.deserializeContentSnapshot(snapshot).toString('utf8'));
}

module.exports = {
	parseCardResponse: parseCardResponse,
	parseContentSnapshot: parseContentSnapshot
};
