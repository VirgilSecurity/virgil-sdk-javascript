import { base64Decode, base64Encode } from '../Lib/base64';

/**
 * JSON-serializable representation of Virgil Card as it is stored in the
 * Virgil Cards Service.
 */
export interface IRawSignedModelJson {
	/**
	 * The signatures of this card's `content_snapshot`.
	 */
	readonly signatures: IRawSignature[];

	/**
	 * The snapshot of this card's contents as a string in base64 encoding.
	 */
	readonly content_snapshot: string;
}

/**
 * JSON-serializable representation of the Virgil Card's signature as it is
 * stored in the Virgil Cards Service..
 */
export interface IRawSignature {
	/**
	 * The signer identifier.
	 */
	readonly signer: string;

	/**
	 * The signature bytes as a string in base64 encoding.
	 */
	readonly signature: string;

	/**
	 * The snapshot of additional attributes associated with the signature
	 * as a string in base64 encoding.
	 */
	readonly snapshot?: string;
}

/**
 * Intermediate representation of the Virgil Card with `contentSnapshot`
 * and `snapshot`s of the signatures in UTF-8.
 */
export class RawSignedModel {

	/**
	 * Converts the `str` in base64 encoding into a `RawSignedModel` object.
	 *
	 * @param {string} str - Base64 string representation of the card as
	 * returned by {@RawSignedModel.toString} method.
	 *
	 * @returns {RawSignedModel}
	 */
	public static fromString(str: string) {
		const jsonStr = base64Decode(str);
		let obj;
		try {
			obj = JSON.parse(jsonStr);
		} catch (error) {
			throw new Error('The string to be parsed is in invalid format');
		}
		return RawSignedModel.fromJson(obj);
	}

	/**
	 * Converts the `json` serializable object into a `RawSignedModel` object.
	 * @param {IRawSignedModelJson} json - JSON-serializable object returned by
	 * {@link RawSignedModel.toJson} method.
	 * @returns {RawSignedModel}
	 */
	public static fromJson(json: IRawSignedModelJson) {
		const contentSnapshotUtf8 = base64Decode(json.content_snapshot);
		const signaturesWithUtf8Snapshots = (json.signatures || []).map(({ signer, signature, snapshot }) => {
			if (snapshot) {
				return {
					signer,
					signature,
					snapshot: base64Decode(snapshot)
				}
			}

			return { signer, signature };
		});
		return new RawSignedModel(contentSnapshotUtf8, signaturesWithUtf8Snapshots);
	}

	/**
	 * Initializes a new instance of `RawSignedModel`.
	 * @param {string} contentSnapshot - The content snapshot in UTF-8.
	 * @param {IRawSignature[]} signatures - The signatures. If signatures
	 * themselves have snapshots, those must also be in UTF-8.
	 */
	constructor(
		public readonly contentSnapshot: string,
		public readonly signatures: IRawSignature[]
	) { }

	/**
	 * This is to make it work with `JSON.stringify`, calls
	 * {@link RawSignedModel.toJson} under the hood.
	 * @returns {IRawSignedModelJson}
	 */
	toJSON(): IRawSignedModelJson {
		return this.toJson();
	}

	/**
	 * Returns a JSON-serializable representation of this model in the
	 * format it is stored in the Virgil Cards Service. (i.e. with
	 * `contentSnapshot` and `snapshot`s of the signatures as base64 encoded
	 * strings.
	 * @returns {IRawSignedModelJson}
	 */
	toJson(): IRawSignedModelJson {
		return {
			content_snapshot: base64Encode(this.contentSnapshot),
			signatures: this.signatures.map(({ signer, signature, snapshot }) => {
				if (snapshot) {
					return {
						signer,
						signature,
						snapshot: base64Encode(snapshot)
					}
				}
				return { signer, signature };
			})
		};
	}

	/**
	 * Serializes this model to string in base64 encoding.
	 * @returns {string}
	 */
	toString() {
		return base64Encode(JSON.stringify(this));
	}

	/**
	 * Same as {@link RawSignedModel.toJson}. Please use that instead.
	 * @returns {IRawSignedModelJson}
	 */
	exportAsJson() {
		return this.toJson();
	}

	/**
	 * Same as {@link RawSignedModel.toString}. Please use that instead.
	 * @returns {string}
	 */
	exportAsString() {
		return this.toString();
	}
}
