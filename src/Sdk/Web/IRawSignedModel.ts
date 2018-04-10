import { base64Decode, base64Encode } from '../Lib/base64';

export interface IRawSignedModelJson { // json
	readonly signatures: IRawSignatureJson[];
	readonly content_snapshot: string;
}

export interface IRawSignatureJson { // json
	readonly signer: string;
	readonly signature: string;
	readonly snapshot?: string;
}

export interface IRawSignature {
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot?: Buffer;
}

export class RawSignedModel {
	public static fromString(str: string) {
		const jsonStr = base64Decode(str).toString();
		let json;
		try {
			json = JSON.parse(jsonStr);
		} catch (e) {
			throw new Error('The string to be parsed is in invalid format');
		}
		return RawSignedModel.fromJson(json);
	}

	public static fromJson(json: IRawSignedModelJson) {
		const contentSnapshot = base64Decode(json.content_snapshot);
		const signatures = json.signatures.map(({ signer, signature, snapshot }: IRawSignatureJson) => ({
			signer,
			signature: base64Decode(signature),
			snapshot: snapshot != null ? base64Decode(snapshot) : undefined
		}));

		return new RawSignedModel(contentSnapshot, signatures);
	}

	constructor(
		public readonly contentSnapshot: Buffer,
		public readonly signatures: IRawSignature[]
	) { }

	toJson(): IRawSignedModelJson {
		return {
			content_snapshot: base64Encode(this.contentSnapshot),
			signatures: this.signatures.map(({ signer, signature, snapshot }: IRawSignature) => ({
				signer,
				signature: base64Encode(signature),
				snapshot: snapshot && base64Encode(snapshot)
			}))
		};
	}

	// this is to make it work with JSON.stringify
	toJSON(): IRawSignedModelJson {
		return this.toJson();
	}

	exportAsString() {
		return base64Encode(JSON.stringify(this.toJson()), 'utf8');
	}

	exportAsJson() {
		return this.toJson();
	}
}
