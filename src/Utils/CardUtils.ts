import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IRawSignature, RawSignedModel } from '../Web/RawSignedModel';
import { ICard, ICardSignature, IExtraData, IRawCardContent } from '../ICard';
import { parseSnapshot } from './SnapshotUtils';

const CARD_ID_BYTE_LENGTH = 32;

/**
 * Calculates ID for the VirgilCard from the `snapshot` of its contents.
 *
 * @hidden
 *
 * @param {ICardCrypto} crypto - Object implementing the {@link ICardCrypto}
 * interface.
 * @param {Buffer} snapshot - The VirgilCard's contents snapshot.
 * @returns {string} - VirgilCard's ID encoded in HEX.
 */
export function generateCardId (crypto: ICardCrypto, snapshot: Buffer): string {
	const fingerprint = crypto.generateSha512(snapshot).slice(0, CARD_ID_BYTE_LENGTH);
	return fingerprint.toString('hex');
}

/**
 * Converts the {@link RawSignedModel} into the {@link ICard}.
 *
 * @hidden
 *
 * @param {ICardCrypto} crypto - Object implementing the {@link ICardCrypto}
 * interface.
 * @param {RawSignedModel} model - The model to convert.
 * @param {boolean} isOutdated - Boolean indicating whether there is a newer
 * Virgil Card replacing the one that `model` represents.
 *
 * @returns {ICard}
 */
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

/**
 * Given the array of `cards`, returns another array with outdated cards
 * filtered out and the `previousCard` properties of the cards that replace
 * the outdated ones being populated with appropriate outdated cards.
 * i.e. turns this (A is for Actual, O is for Outdated):
 * 		A -> O -> A -> A -> O
 * into this
 * 		A -> A -> A
 * 		|         |
 * 		O         O
 * @param {ICard[]} cards - The cards array to transform.
 * @returns {ICard[]} - Transformed array.
 */
export function linkedCardList (cards: ICard[]): ICard[] {
	const unsorted: { [key: string]: ICard } = Object.create(null);

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

	for (const id in unsorted) {
		result.push(unsorted[id]);
	}

	return result;
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
