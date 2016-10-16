import { parseJSON } from '../utils/parse-json';
import { deserializeContentSnapshot, deserializePublicKey, deserializeSignatures } from './serializer';

export function parseCardResponse(res) {
	const cardData = parseContentSnapshot(res.content_snapshot);
	return {
		id: res.id,
		snapshot: deserializeContentSnapshot(res.content_snapshot),
		publicKey: deserializePublicKey(cardData.public_key),
		identity: cardData.identity,
		identityType: cardData.identity_type,
		scope: cardData.scope,
		data: cardData.data,
		info: cardData.info,
		createdAt: res.meta.created_at,
		version: res.meta.card_version,
		signatures: deserializeSignatures(res.meta.signs)
	};
}

export function parseContentSnapshot(snapshot) {
	return parseJSON(deserializeContentSnapshot(snapshot).toString('utf8'));
}
