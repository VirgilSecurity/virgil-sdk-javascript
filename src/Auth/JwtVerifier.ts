import { IPublicKey, IAccessTokenSigner } from '../types';
import { Jwt } from './Jwt';
import { JwtContentType, VirgilContentType } from './jwt-constants';
import { assert } from '../Lib/assert';

/**
 * {@link JwtVerifier} initialization options.
 */
export interface IJwtVerifierOptions {
	/**
	 * Object used to verify signatures of tokens.
	 */
	accessTokenSigner: IAccessTokenSigner;

	/**
	 * API Public Key from Virgil Dashboard to be used to verify signatures
	 * of tokens.
	 */
	apiPublicKey: IPublicKey,

	/**
	 * ID of the API Key from Virgil Dashboard.
	 */
	apiKeyId: string;
}

/**
 * Class responsible for verification of JWTs.
 */
export class JwtVerifier {
	/**
	 * @see {@link IJwtVerifierOptions.accessTokenSigner}
	 */
	public readonly accessTokenSigner: IAccessTokenSigner;

	/**
	 * @see {@link IJwtVerifierOptions.apiPublicKey}
	 */
	public readonly apiPublicKey: IPublicKey;

	/**
	 * @see {@link IJwtVerifierOptions.apiKeyId}
	 */
	public readonly apiKeyId: string;

	public constructor (options: IJwtVerifierOptions) {
		validateOptions(options);
		this.accessTokenSigner = options.accessTokenSigner;
		this.apiPublicKey = options.apiPublicKey;
		this.apiKeyId = options.apiKeyId;
	}

	/**
	 * Verifies the validity of the given JWT.
	 * @param {Jwt} token - The JWT to verify.
	 * @returns {boolean}
	 */
	public verifyToken(token: Jwt): boolean {
		if (token == null) {
			throw new Error('Token is empty');
		}

		if (!this.allFieldsAreCorrect(token)) {
			return false;
		}

		return this.accessTokenSigner.verifyTokenSignature(
			{ value: token.unsignedData, encoding: 'utf8' },
			{ value: token.signature!, encoding: 'base64' },
			this.apiPublicKey
		);
	}

	private allFieldsAreCorrect (token: Jwt): boolean {
		return token.header.kid == this.apiKeyId
			&& token.header.alg == this.accessTokenSigner.getAlgorithm()
			&& token.header.cty == VirgilContentType
			&& token.header.typ == JwtContentType;
	}
}

function validateOptions(opts: IJwtVerifierOptions) {
	const invalidOptionMessage = (name: keyof IJwtVerifierOptions) =>
		`Invalid JwtVerifier options. \`${name}\` is required`;

	assert(opts != null, 'JwtVerifier options must be provided');
	assert(opts.apiPublicKey != null, invalidOptionMessage('apiPublicKey'));
	assert(opts.apiKeyId != null, invalidOptionMessage('apiKeyId'));
	assert(opts.accessTokenSigner != null, invalidOptionMessage('accessTokenSigner'));
}
