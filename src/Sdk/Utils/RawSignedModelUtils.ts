import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { ICard, IExtraData } from '../ICard';
import { IRawSignedModel } from '../Web/IRawSignedModel';
import { base64Decode } from '../Lib/base64';
import { ICardParams, takeSnapshot } from './SnapshotUtils';

export const CardVersion = '5.0';

export function cardToRawSignedModel (crypto: ICardCrypto, card: ICard) {
	const model = generateRawSigned(crypto, card);

	for (const sign of card.signatures) {
		const { signature, signer, snapshot } = sign;

		model.signatures.push({ signature, signer, snapshot });
	}

	return model;
}

export function generateRawSigned (crypto: ICardCrypto, params: ICard): IRawSignedModel {
	const { identity, publicKey, previousCardId, createdAt } = params;

	const details = {
		identity,
		previousCardId,
		createdAt,
		version: CardVersion,
		publicKey: crypto.exportPublicKey(publicKey)
	};

	return { content_snapshot: takeSnapshot(details), signatures: [] } as IRawSignedModel;
}

export function generateRawSignedFromString (str: string): IRawSignedModel {
	if (!str) throw new Error("str is empty");

	return generateRawSignedFromJson(
		base64Decode(str).toString('utf8')
	);

}
export function generateRawSignedFromJson (json: string): IRawSignedModel {
	if (!json) throw new Error("json is empty");

	return JSON.parse(json) as IRawSignedModel;
}