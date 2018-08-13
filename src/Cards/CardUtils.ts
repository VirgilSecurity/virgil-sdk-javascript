import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IRawSignature, RawSignedModel } from './RawSignedModel';
import { ICard, ICardSignature, IExtraData, INewCardParams, IRawCardContent } from './ICard';
import { getUnixTimestamp } from '../Lib/timestamp';
import { CardIdByteLength, CardVersion } from './constants';
import { base64Encode } from '../Lib/base64';

/**
 * Converts an {@link ICard} to a {@link RawSignedModel}.
 *
 * @hidden
 *
 * @param {ICard} card - The {@link ICard} to convert.
 * @returns {RawSignedModel}
 */
export function cardToRawSignedModel (card: ICard): RawSignedModel {
	return new RawSignedModel(card.contentSnapshot, card.signatures.slice());
}

/**
 * Generates a {@link RawSignedModel} from the given `params`.
 *
 * @hidden
 *
 * @param {ICardCrypto} crypto - Object implementing the {@link ICardCrypto}
 * interface.
 * @param {INewCardParams} params - New card parameters.
 * @returns {RawSignedModel}
 */
export function generateRawSigned (crypto: ICardCrypto, params: INewCardParams): RawSignedModel {
	const { identity, publicKey, previousCardId } = params;
	const now = getUnixTimestamp(new Date);

	const details = {
		identity: identity!,
		previous_card_id: previousCardId,
		created_at: now,
		version: CardVersion,
		public_key: base64Encode(crypto.exportPublicKey(publicKey))
	};

	return new RawSignedModel(JSON.stringify(details), []);
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
	const content = JSON.parse(model.contentSnapshot) as IRawCardContent;
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
 * ```
 * A -> O -> A -> A -> O
 * ```
 * into this
 * ```
 * A -> A -> A
 * |         |
 * O         O
 * ```
 *
 * @hidden
 *
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

/**
 * Calculates ID for the VirgilCard from the `snapshot` of its contents.
 *
 * @hidden
 *
 * @param {ICardCrypto} crypto - Object implementing the {@link ICardCrypto}
 * interface.
 * @param {string} snapshot - The VirgilCard's contents snapshot.
 * @returns {string} - VirgilCard's ID encoded in HEX.
 */
function generateCardId (crypto: ICardCrypto, snapshot: string): string {
	const fingerprint = crypto.generateSha512(snapshot).slice(0, CardIdByteLength);
	return fingerprint.toString('hex');
}

function rawSignToCardSign ({ snapshot, signature, signer }: IRawSignature): ICardSignature {
	return {
		signer,
		signature,
		snapshot,
		extraFields: tryParseExtraFields(snapshot)
	};
}

function tryParseExtraFields(snapshot?: string): IExtraData {
	if (snapshot) {
		try {
			return JSON.parse(snapshot) as IExtraData;
		} catch (ignored) {}
	}

	return {};
}
