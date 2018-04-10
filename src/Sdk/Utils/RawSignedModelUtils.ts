import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { ICard, INewCardParams } from '../ICard';
import { RawSignedModel } from '../Web/IRawSignedModel';
import { base64Encode } from '../Lib/base64';
import { takeSnapshot } from './SnapshotUtils';

export const CardVersion = '5.0';

export function cardToRawSignedModel (crypto: ICardCrypto, card: ICard): RawSignedModel {
	return new RawSignedModel(card.contentSnapshot, card.signatures.slice());
}

export function generateRawSigned (crypto: ICardCrypto, params: INewCardParams, createdAt: number): RawSignedModel {
	const { identity, publicKey, previousCardId } = params;

	const details = {
		identity: identity!,
		previous_card_id: previousCardId,
		created_at: createdAt,
		version: CardVersion,
		public_key: base64Encode(crypto.exportPublicKey(publicKey))
	};

	return new RawSignedModel(takeSnapshot(details), []);
}
