import { ICard } from './ICard';
import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IPublicKey } from '../CryptoApi/IPublicKey';
import { base64Decode } from './Lib/base64';
import { SelfSigner, VirgilSigner } from './Web/signer-types';

export interface ICardVerifier {
	verifyCard(card: ICard): boolean;
}

export interface IVerifierCredentials {
	signer: string;
	publicKeyBase64: string;
}

export interface IVirgilCardVerifierParams {
	verifySelfSignature?: boolean;
	verifyVirgilSignature?: boolean;
	whitelists?: IWhitelist[]
}

export type IWhitelist = IVerifierCredentials[];

const DEFAULTS: IVirgilCardVerifierParams = {
	verifySelfSignature: true,
	verifyVirgilSignature: true,
	whitelists: []
};

export class VirgilCardVerifier implements ICardVerifier {
	public whitelists: IWhitelist[];
	public verifySelfSignature: boolean;
	public verifyVirgilSignature: boolean;
	public virgilPublicKeyBase64 = "MCowBQYDK2VwAyEAljOYGANYiVq1WbvVvoYIKtvZi2ji9bAhxyu6iV/LF8M=";

	public constructor (private readonly crypto: ICardCrypto, options?: IVirgilCardVerifierParams) {
		const params = { ...DEFAULTS, ...(options || {})};
		this.verifySelfSignature = params.verifySelfSignature!;
		this.verifyVirgilSignature = params.verifyVirgilSignature!;
		this.whitelists = params.whitelists!;
	}

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

		return this.crypto.verifySignature(extendedSnapshot, signature.signature, signerPublicKey);
	}
}
