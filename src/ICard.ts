import { IPublicKey } from './CryptoApi/IPublicKey';
import { IPrivateKey } from './CryptoApi/IPrivateKey';

export interface IExtraData {
	[key: string]: string;
}

/**
 * Object representation of the card's signature.
 */
export interface ICardSignature {
	/**
	 * Signature identifier.
	 */
	readonly signer: string;

	/**
	 * The signature as a string in base64 encoding.
	 */
	readonly signature: string;

	/**
	 * Snapshot of the signature's associated `extraFields` as a string in
	 * UTF-8 encoding.
	 */
	readonly snapshot?: string;

	/**
	 * Custom attributes associated with the signature.
	 */
	readonly extraFields?: IExtraData;
}

/**
 * Object representation of the Virgil Card with the properties encoded in
 * content snapshot directly accessible.
 */
export interface ICard {
	readonly id: string;
	readonly identity: string;

	/**
	 * The {@link IPublicKey} object representing this card's public key,
	 */
	readonly publicKey: IPublicKey;

	/**
	 * Card's version. Currently always equal to "5.0"
	 */
	readonly version: string;

	/**
	 * The date the card was created at.
	 */
	readonly createdAt: Date;

	/**
	 * List of cards signatures.
	 */
	readonly signatures: ICardSignature[];

	/**
	 * Id of the card this card replaces as outdated, if any.
	 */
	readonly previousCardId?: string;

	/**
	 * The content snapshot of the card as a string in UTF-8 encoding.
	 */
	readonly contentSnapshot: string;

	/**
	 * Indicates whether this card had been replaced by a newer card.
	 */
	isOutdated: boolean;

	/**
	 * The card identified by `previousCardId` of this card, if any.
	 *
	 * > Note! This is only populated by {@link CardManager.searchCards}
	 * method.
	 */
	previousCard?: ICard;
}

/**
 * Properties encoded in the card's content snapshot.
 * @hidden
 */
export interface IRawCardContent {
	readonly identity: string;
	readonly public_key: string;
	readonly version: string;
	readonly created_at: number;
	readonly previous_card_id?: string;
}

/**
 * Parameters required to create new card.
 */
export interface INewCardParams {

	/**
	 * The card's corresponding private key.
	 */
	readonly privateKey: IPrivateKey;

	/**
	 * The card's public key.
	 */
	readonly publicKey: IPublicKey;

	/**
	 * The card's identity.
	 *
	 * When publishing a card, the value specified in the "sub" property of
	 * the JWT takes precedence over this value.
	 *
	 * @see {@link CardManager.publishCard}
	 */
	readonly identity?: string;

	/**
	 * Id of the card the new card is meant to replace.
	 */
	readonly previousCardId?: string;

	/**
	 * Custom attributes to be associated with the "self" signature of the
	 * new card.
	 */
	readonly extraFields?: IExtraData;
}
