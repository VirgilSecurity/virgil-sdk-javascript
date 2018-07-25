import { RawSignedModel } from './RawSignedModel';
import { IPrivateKey } from '../../CryptoApi/IPrivateKey';
import { ICardCrypto } from '../../CryptoApi/ICardCrypto';
import { IExtraData } from '../ICard';
import { takeSnapshot } from '../Utils/SnapshotUtils';
import { SelfSigner } from './signer-types';

export interface IRawSignParams {
	readonly model: RawSignedModel;
	readonly signerPrivateKey: IPrivateKey;
	readonly extraFields?: IExtraData;
	readonly signer?: string;
}

export interface IFinalSignParams {
	readonly model: RawSignedModel;
	readonly signerPrivateKey: IPrivateKey;
	readonly extraSnapshot?: Buffer;
	readonly signer: string;
}

export class ModelSigner {

	public constructor (private readonly crypto: ICardCrypto) {}

	public sign (rawParams: IRawSignParams) {
		const { model, signerPrivateKey, signer, extraSnapshot } = this.prepareParams(rawParams);

		const signedSnapshot = extraSnapshot != null
			? Buffer.concat([ model.contentSnapshot, extraSnapshot ])
			: model.contentSnapshot;

		const signature = this.crypto.generateSignature(signedSnapshot, signerPrivateKey);

		model.signatures.push({
			signer,
			signature: signature,
			snapshot: extraSnapshot
		});
	}

	private prepareParams ({ model, signerPrivateKey, extraFields, signer }: IRawSignParams): IFinalSignParams {
		signer = signer || SelfSigner;

		let extraSnapshot;
		if (extraFields != null) {
			extraSnapshot = takeSnapshot(extraFields);
		}

		const final: IFinalSignParams = { model, signerPrivateKey, signer, extraSnapshot };

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
