import { IAccessTokenSigner } from '../../../CryptoApi/IAccessTokenSigner';
import { IPublicKey } from '../../../CryptoApi/IPublicKey';
import { Jwt, JwtContentType, VirgilContentType } from './Jwt';
import { assert } from '../../Lib/assert';

export type JwtVerifierOptions = {
	accessTokenSigner: IAccessTokenSigner;
	apiPublicKey: IPublicKey,
	apiKeyId: string;
}

export class JwtVerifier {
	public readonly accessTokenSigner: IAccessTokenSigner;
	public readonly apiPublicKey: IPublicKey;
	public readonly apiKeyId: string;

	public constructor (options: JwtVerifierOptions) {
		validateOptions(options);
		this.accessTokenSigner = options.accessTokenSigner;
		this.apiPublicKey = options.apiPublicKey;
		this.apiKeyId = options.apiKeyId;
	}


	public verifyToken(token: Jwt): boolean {
		if (token == null) {
			throw new Error('Token is empty');
		}

		if (!this.allFieldsAreCorrect(token)) {
			return false;
		}

		return this.accessTokenSigner.verifyTokenSignature(
			token.unsignedData,
			token.signature!,
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

function validateOptions(opts: JwtVerifierOptions) {
	const invalidOptionMessage = (name: keyof JwtVerifierOptions) =>
		`Invalid JwtVerifier options. \`${name}\` is required`;

	assert(opts != null, 'JwtVerifier options must be provided');
	assert(opts.apiPublicKey != null, invalidOptionMessage('apiPublicKey'));
	assert(opts.apiKeyId != null, invalidOptionMessage('apiKeyId'));
	assert(opts.accessTokenSigner != null, invalidOptionMessage('accessTokenSigner'));
}
