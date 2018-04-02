export interface IRawSignature {  // json
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot?: Buffer;
}

export interface IRawSignedModel {  // json
	readonly signatures: IRawSignature[];
	readonly content_snapshot: Buffer;
}