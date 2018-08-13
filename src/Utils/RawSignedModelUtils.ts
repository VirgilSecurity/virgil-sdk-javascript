import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { ICard, INewCardParams } from '../ICard';
import { RawSignedModel } from '../Web/RawSignedModel';
import { base64Encode } from '../lib/base64';
import { takeSnapshot } from './SnapshotUtils';
import { getUnixTimestamp } from '../lib/timestamp';

/**
 * @hidden
 * @type {string}
 */
export const CardVersion = '5.0';

/**
 * Converts an {@link ICard} to a {@link RawSignedModel}.
 *
 * @hidden
 *
 * @param {ICardCrypto} crypto - Object implementing the {@link ICardCrypto}
 * interface.
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

	return new RawSignedModel(takeSnapshot(details), []);
}
