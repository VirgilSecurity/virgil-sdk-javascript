import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { IRawSignature, IRawSignedModel } from '../Web/IRawSignedModel';
import { ICard, ICardSignature, IExtraData } from '../ICard';
import { parseSnapshot } from './SnapshotUtils';

const cardIdLength = 16;

export function generateCardId (crypto: ICardCrypto, snapshot: Buffer): string {
	const fingerprint = crypto.generateSHA512(snapshot);

	return fingerprint.toString('hex').substr(0, cardIdLength);
}

export function parseRawSignedModel (crypto: ICardCrypto, model: IRawSignedModel, isOutDated = false): ICard {
	const content = parseSnapshot(model.content_snapshot);
	const signatures = model.signatures.map(rawSignToCardSign);

	return {
		id: generateCardId(crypto, model.content_snapshot),
		publicKey: crypto.importPublicKey(content.publicKey),
		contentSnapshot: model.content_snapshot,
		identity: content.identity,
		version: content.version!,
		createdAt: content.createdAt!,
		previousCardId: content.previousCardId!,
		signatures,
		isOutDated
	};
}

function rawSignToCardSign ({ snapshot, signature, signer }: IRawSignature): ICardSignature {
	if (snapshot == null) throw new Error('`snapshot cant be null`');

	return {
		snapshot, signature, signer,
		extraFields: tryParseExtraFields(snapshot)
	};
}

function tryParseExtraFields(snapshot?: Buffer): IExtraData {
	if (snapshot) {
		try {
			return parseSnapshot(snapshot) as any as IExtraData;
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

		unsorted[card.previousCardId].isOutDated = true;
		card.previousCard = unsorted[card.previousCardId];
		delete unsorted[card.previousCardId];
	}

	const result = [];

	for (const id in unsorted) if (unsorted.hasOwnProperty(id)) {
		result.push(unsorted[id]);
	}

	return result;
}