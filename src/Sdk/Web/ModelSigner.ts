import { IRawSignedModel } from './IRawSignedModel';
import { IPrivateKey } from '../../CryptoApi/IPrivateKey';
import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { IExtraData } from '../ICard';

export interface IRawSignParams {
	readonly model: IRawSignedModel;
	readonly signerPrivateKey: IPrivateKey;
	readonly signatureSnapshot?: Buffer;
	readonly signer?: string;
	readonly extraFields?: IExtraData;
}

export interface IFinalSignParams {
	readonly model: IRawSignedModel;
	readonly signerPrivateKey: IPrivateKey;
	readonly signatureSnapshot?: Buffer;
	readonly signer: string;
}

export const SelfSigner = "self";
export const VirgilSigner = "virgil";

export class ModelSigner {

	public constructor (private readonly crypto: ICardCrypto) {}

	public sign (rawParams: IRawSignParams) {
		const { model, signerPrivateKey, signer, signatureSnapshot } = this.prepareParams(rawParams);

		const extendedSnapshot = signatureSnapshot == null
			? model.content_snapshot
			: Buffer.concat([model.content_snapshot, signatureSnapshot]);

		const signature = this.crypto.generateSignature(extendedSnapshot, signerPrivateKey);

		model.signatures.push({
			signer,
			signature,
			snapshot: signatureSnapshot
		});
	}

	private prepareParams ({ model, signerPrivateKey, signatureSnapshot, signer, extraFields }: IRawSignParams): IFinalSignParams {
		if (!signer) signer = SelfSigner;

		if (extraFields != null) {
			// signatureSnapshot = SnapshotUtils.TakeSnapshot(ExtraFields)
		}

		const final: IFinalSignParams = { model, signerPrivateKey, signer, signatureSnapshot };

		this.validate(final);

		return final;
	}

	private validate ({ model, signerPrivateKey, signer }: IFinalSignParams) {
		if (model == null) {
			throw new Error("Model is empty");
		}

		if (signerPrivateKey == null) {
			throw new Error("`signerPrivateKey` property is mandatory");
		}

		if (model.signatures != null && model.signatures.some(s => s.signer == signer)) {
			throw new Error("The model already has this signature.");
		}
	}

}