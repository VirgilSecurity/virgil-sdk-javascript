import { IPublicKey } from '../CryptoApi/IPublicKey';

export interface ISignExtraFields {
	[key: string]: string;
}

export interface ICardSignature {
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot: Buffer;
	readonly extraFields: ISignExtraFields;
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

export interface IRawCardContent {
	readonly identity: string;
	readonly publicKey: IPublicKey;
	readonly version: string;
	readonly createdAt: Date;
	readonly previousCardId: string;
}