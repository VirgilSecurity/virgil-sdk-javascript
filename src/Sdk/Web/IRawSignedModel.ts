export interface IRawSignature {
	readonly signer: string;
	readonly signature: Buffer;
	readonly snapshot?: Buffer;
}

export interface IRawSignedModel {
	readonly signatures: IRawSignature[];
	readonly contentSnapshot: Buffer;
}