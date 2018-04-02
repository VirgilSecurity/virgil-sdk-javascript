import { ICard } from './ICard';
import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IPublicKey } from '../CryptoApi/IPublicKey';
import { base64Decode } from './Lib/base64';
import { ModelSigner, SelfSigner, VirgilSigner } from './Web/ModelSigner';

export interface ICardVerifier {
	verifyCard(card: ICard): boolean;
}

export interface IVerifierCredentials {
	signer: string;
	publicKeyBase64: string;
}

export class CardVerificationError extends Error {
	public constructor(m: string) {
		super(m);
		Object.setPrototypeOf(this, CardVerificationError.prototype);
	}
}

export type IWhiteList = IVerifierCredentials[];

export class VirgilCardVerifier implements ICardVerifier {
	public whiteLists: IWhiteList[] = [];
	public verifySelfSignature = true;
	public verifyVirgilSignature = true;
	public virgilPublicKeyBase64 = "MCowBQYDK2VwAyEAljOYGANYiVq1WbvVvoYIKtvZi2ji9bAhxyu6iV/LF8M=";

	public constructor (private readonly crypto: ICardCrypto) {}

	public verifyCard(card: ICard): boolean {
		if (this.selfValidationFailed(card)) {
			return false;
		}
		if (this.virgilValidationFailed(card)) {
			return false;
		}
		if (!this.whiteLists || this.whiteLists.length === 0) {
			return false;
		}
		const signers = card.signatures.map(s => s.signer);

		for (const whitelist of this.whiteLists) {

			if (whitelist == null || whitelist.length === 0) {
				return false;
			}

			const intersectedCreds = whitelist.filter(x => signers.includes(x.signer));

			if (intersectedCreds.length === 0) {
				return false;
			}

			for (const cred of intersectedCreds) {
				const signerPublicKey = this.getPublicKey(cred.publicKeyBase64);

				if (this.validateSignerSignature(card, signerPublicKey, cred.signer)) {
					break;
				}

				if (cred === intersectedCreds[intersectedCreds.length - 1]) {
					return false;
				}
			}
		}

		return true;
	}

	private selfValidationFailed (card: ICard) {
		return this.verifySelfSignature
			&& !this.validateSignerSignature(card, card.publicKey, SelfSigner)
	}

	private virgilValidationFailed (card: ICard) {
		const key = this.getPublicKey(this.virgilPublicKeyBase64);

		return this.verifyVirgilSignature
			&& !this.validateSignerSignature(card, key, VirgilSigner);
	}

	private getPublicKey(signerPublicKeyBase64: string): IPublicKey {
		const publicKeyBytes = base64Decode(signerPublicKeyBase64);
		return this.crypto.importPublicKey(publicKeyBytes);
	}

	private validateSignerSignature(card: ICard, signerPublicKey: IPublicKey, signer: string): boolean {
		const signature = card.signatures.find(s => s.signer === signer);

		if (signature == null) return false;

		const extendedSnapshot = signature.snapshot == null
			? card.contentSnapshot
			: Buffer.concat([card.contentSnapshot, signature.snapshot]);

		return this.crypto.verifySignature( signature.signature, extendedSnapshot, signerPublicKey );
	}
}