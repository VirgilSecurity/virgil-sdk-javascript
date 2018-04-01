import { IPublicKey } from '../CryptoApi/IPublicKey';

export interface IExtraData {
	[key: string]: string;
}

export interface ICardSignature {
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot: Buffer;
	readonly extraFields: IExtraData;
}

export interface ICard {
	readonly id: string;
	readonly identity: string;
	readonly publicKey: IPublicKey;
	readonly version: string;
	readonly createdAt: Date;
	readonly signatures: ICardSignature[];
	readonly previousCardId: string;
	readonly contentSnapshot: Buffer;
	readonly isOutDated: boolean;
}

export interface IRawCardContent { // json
	readonly identity: string;
	readonly public_key: IPublicKey;
	readonly version: string;
	readonly created_at: Date;
	readonly previous_card_id: string;
}