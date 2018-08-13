import { ICard } from './ICard';
import { ICardCrypto } from './CryptoApi/ICardCrypto';
import { IPublicKey } from './CryptoApi/IPublicKey';
import { SelfSigner, VirgilSigner } from './Web/signer-types';

/**
 * Interface to be implemented by an object capable of verifying the validity
 * of Virgil Cards.
 */
export interface ICardVerifier {
	/**
	 * Verifies the validity of the given `card`.
	 * @param {ICard} card
	 * @returns {boolean}
	 */
	verifyCard(card: ICard): boolean;
}

/**
 * Signature identifier and the public key to be used to verify additional
 * signatures of the cards, if any.
 */
export interface IVerifierCredentials {
	/**
	 * String identifying the signature to be verified with `publicKeyBase64`.
	 */
	signer: string;

	/**
	 * Public key to be used to verify the signature identified by `signer`.
	 */
	publicKeyBase64: string;
}

/**
 * The {@link VirgilCardVerifier} constructor options.
 */
export interface IVirgilCardVerifierParams {
	/**
	 * Indicates whether the "self" signature of the cards should be verified.
	 * Self signature is a signature generated with the card's corresponding
	 * private key.
	 */
	verifySelfSignature?: boolean;

	/**
	 * Indicates whether the "virgil" signature of the cards should be
	 * verified. Virgil signature is appended to the list of card's signatures
	 * when the card is published.
	 */
	verifyVirgilSignature?: boolean;

	/**
	 * Array of arrays of {@link IVerifierCredentials} objects to be used to
	 * verify additional signatures of the cards, if any.
	 *
	 * If whitelists are provided, the card must have at least one signature
	 * from each whitelist.
	 */
	whitelists?: IWhitelist[]
}

export type IWhitelist = IVerifierCredentials[];

const DEFAULTS: IVirgilCardVerifierParams = {
	verifySelfSignature: true,
	verifyVirgilSignature: true,
	whitelists: []
};

const VIRGIL_CARDS_PUBKEY_BASE64 = 'MCowBQYDK2VwAyEAljOYGANYiVq1WbvVvoYIKtvZi2ji9bAhxyu6iV/LF8M=';

/**
 * Class responsible for validating cards by verifying their digital
 * signatures.
 */
export class VirgilCardVerifier implements ICardVerifier {
	/**
	 * @see {@link IVirgilCardVerifierParams}
	 */
	public whitelists: IWhitelist[];

	/**
	 * @see {@link IVirgilCardVerifierParams}
	 */
	public verifySelfSignature: boolean;

	/**
	 * @see {@link IVirgilCardVerifierParams}
	 */
	public verifyVirgilSignature: boolean;

	/**
	 * Public key of the Virgil Cards service used for "virgil" signature
	 * verification.
	 */
	public readonly virgilCardsPublicKey: IPublicKey;

	/**
	 * Initializes a new instance of `VirgilCardVerifier`.
	 * @param {ICardCrypto} crypto - Object implementing the
	 * {@link ICardCrypto} interface.
	 * @param {IVirgilCardVerifierParams} options - Initialization options.
	 */
	public constructor (private readonly crypto: ICardCrypto, options?: IVirgilCardVerifierParams) {
		const params = { ...DEFAULTS, ...(options || {})};
		this.verifySelfSignature = params.verifySelfSignature!;
		this.verifyVirgilSignature = params.verifyVirgilSignature!;
		this.whitelists = params.whitelists!;
		this.virgilCardsPublicKey = crypto.importPublicKey(VIRGIL_CARDS_PUBKEY_BASE64);
	}

	/**
	 * Verifies the signatures of the `card`.
	 * @param {ICard} card
	 * @returns {boolean} `true` if the signatures to be verified are present
	 * and valid, otherwise `false`.
	 */
	public verifyCard(card: ICard): boolean {
		if (this.selfValidationFailed(card)) {
			return false;
		}
		if (this.virgilValidationFailed(card)) {
			return false;
		}
		if (!this.whitelists || this.whitelists.length === 0) {
			return true;
		}
		const signers = card.signatures.map(s => s.signer);

		for (const whitelist of this.whitelists) {

			if (whitelist == null || whitelist.length === 0) {
				return false;
			}

			const intersectedCreds = whitelist.filter(x => signers.indexOf(x.signer) !== -1);

			if (intersectedCreds.length === 0) {
				return false;
			}

			const isValidForSome = intersectedCreds.some(cred =>
				this.validateSignerSignature(
					card,
					this.getPublicKey(cred.publicKeyBase64),
					cred.signer
				)
			);

			if (!isValidForSome) {
				return false;
			}
		}

		return true;
	}

	private selfValidationFailed (card: ICard) {
		return this.verifySelfSignature
			&& !this.validateSignerSignature(card, card.publicKey, SelfSigner)
	}

	private virgilValidationFailed (card: ICard) {
		return this.verifyVirgilSignature
			&& !this.validateSignerSignature(card, this.virgilCardsPublicKey, VirgilSigner);
	}

	private getPublicKey(signerPublicKeyBase64: string): IPublicKey {
		return this.crypto.importPublicKey(signerPublicKeyBase64);
	}

	private validateSignerSignature(card: ICard, signerPublicKey: IPublicKey, signer: string): boolean {
		const signature = card.signatures.find(s => s.signer === signer);

		if (signature == null) return false;

		const extendedSnapshot = signature.snapshot == null
			? card.contentSnapshot
			: card.contentSnapshot + signature.snapshot;

		return this.crypto.verifySignature(extendedSnapshot, signature.signature, signerPublicKey);
	}
}
