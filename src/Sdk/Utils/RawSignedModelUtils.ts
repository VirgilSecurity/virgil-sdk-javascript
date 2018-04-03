import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { ICard } from '../ICard';
import { IRawSignedModel } from '../Web/IRawSignedModel';
import { base64Decode } from '../Lib/base64';
import { ICardParams, takeSnapshot } from './SnapshotUtils';

export const CardVersion = '5.0';

export function cardToRawSignedModel (crypto: ICardCrypto, card: ICard) {
	const model = generateRawSigned(crypto, {
		identity: card.identity,
		previousCardId: card.previousCardId,
		publicKey: card.publicKey,
		createdAt: card.createdAt
	});

	for (const sign of card.signatures) {
		const { signature, signer, snapshot } = sign;

		model.signatures.push({ signature, signer, snapshot });
	}

	return model;
}

export function generateRawSigned (crypto: ICardCrypto, params: ICardParams): IRawSignedModel {
	const details = {
		version: CardVersion,
		...params,
		publicKey: crypto.exportPublicKey(params.publicKey)
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