import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { IRawSignature, RawSignedModel } from '../Web/RawSignedModel';
import { ICard, ICardSignature, IExtraData, IRawCardContent } from '../ICard';
import { parseSnapshot } from './SnapshotUtils';

const CARD_ID_BYTE_LENGTH = 32;

export function generateCardId (crypto: ICardCrypto, snapshot: Buffer): string {
	const fingerprint = crypto.generateSha512(snapshot).slice(0, CARD_ID_BYTE_LENGTH);
	return fingerprint.toString('hex');
}

export function parseRawSignedModel (crypto: ICardCrypto, model: RawSignedModel, isOutdated = false): ICard {
	const content = parseSnapshot<IRawCardContent>(model.contentSnapshot);
	const signatures = model.signatures.map(rawSignToCardSign);

	return {
		id: generateCardId(crypto, model.contentSnapshot),
		publicKey: crypto.importPublicKey(content.public_key),
		contentSnapshot: model.contentSnapshot,
		identity: content.identity,
		version: content.version,
		createdAt: new Date(content.created_at * 1000),
		previousCardId: content.previous_card_id,
		signatures,
		isOutdated
	};
}

function rawSignToCardSign ({ snapshot, signature, signer }: IRawSignature): ICardSignature {
	return {
		signer,
		signature,
		snapshot,
		extraFields: tryParseExtraFields(snapshot)
	};
}

function tryParseExtraFields(snapshot?: Buffer): IExtraData {
	if (snapshot) {
		try {
			return parseSnapshot<IExtraData>(snapshot);
		} catch (ignored) {}
	}

	return {};
}

export function linkedCardList (cards: ICard[]): ICard[] {
	const unsorted: { [key: string]: ICard } = {};

	for (const card of cards) {
		unsorted[card.id] = card;
	}

	for (const card of cards) {
		if (card.previousCardId == null) continue;
		if (unsorted[card.previousCardId] == null) continue;

		unsorted[card.previousCardId].isOutdated = true;
		card.previousCard = unsorted[card.previousCardId];
		delete unsorted[card.previousCardId];
	}

	const result = [];

	for (const id in unsorted) if (unsorted.hasOwnProperty(id)) {
		result.push(unsorted[id]);
	}

	return result;
}
