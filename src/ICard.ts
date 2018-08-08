import { IPublicKey } from './CryptoApi/IPublicKey';
import { IPrivateKey } from './CryptoApi/IPrivateKey';

export interface IExtraData {
	[key: string]: string;
}

export interface ICardSignature {
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot?: Buffer;
	readonly extraFields?: IExtraData;
}

export interface ICard {
	readonly id: string;
	readonly identity: string;
	readonly publicKey: IPublicKey;
	readonly version: string;
	readonly createdAt: Date;
	readonly signatures: ICardSignature[];
	readonly previousCardId?: string;
	readonly contentSnapshot: Buffer;
	isOutdated: boolean;
	previousCard?: ICard;
}

export interface IRawCardContent { // json
	readonly identity: string;
	readonly public_key: string;
	readonly version: string;
	readonly created_at: number;
	readonly previous_card_id?: string;
}

export interface INewCardParams {
	readonly privateKey: IPrivateKey;
	readonly publicKey: IPublicKey;
	readonly identity?: string;
	readonly previousCardId?: string;
	readonly extraFields?: IExtraData;
}
