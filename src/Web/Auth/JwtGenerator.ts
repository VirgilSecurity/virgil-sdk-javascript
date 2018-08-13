import { IPrivateKey } from '../../CryptoApi/IPrivateKey';
import { IAccessTokenSigner } from '../../CryptoApi/IAccessTokenSigner';
import { IExtraData } from '../../ICard';
import {
	IJwtBody,
	IJwtHeader,
	Jwt
} from './Jwt';
import {
	IssuerPrefix,
	JwtContentType,
	SubjectPrefix,
	VirgilContentType
} from './jwt-constants';
import { getUnixTimestamp } from '../../lib/timestamp';
import { assert } from '../../lib/assert';

/**
 * {@link JwtGenerator} initialization options.
 */
export interface IJwtGeneratorOptions {
	/**
	 * API Private key from Virgil Dashboard to be used to generate
	 * signatures of tokens.
	 */
	apiKey: IPrivateKey;

	/**
	 * ID of the API Key from Virgil Dashboard.
	 */
	apiKeyId: string;

	/**
	 * Application ID from Virgil Dashboard. This will be the value of the
	 * `Issuer` field in generated tokens.
	 */
	appId: string;

	/**
	 * Object used to generate signatures of tokens.
	 */
	accessTokenSigner: IAccessTokenSigner;

	/**
	 * Time to live in milliseconds of the tokens created by this generator.
	 * Optional. Default is `20 * 60 * 1000` (20 minutes).
	 */
	millisecondsToLive?: number;
}

const DEFAULT_TOKEN_TTL = 20 * 60 * 1000; // 20 minutes

/**
 * Class responsible for JWT generation.
 */
export class JwtGenerator {
	/**
	 * @see {@link IJwtGeneratorOptions.appId}
	 */
	public readonly appId: string;

	/**
	 * @see {@link IJwtGeneratorOptions.apiKey}
	 */
	public readonly apiKey: IPrivateKey;

	/**
	 * @see {@link IJwtGeneratorOptions.apiKeyId}
	 */
	public readonly apiKeyId: string;

	/**
	 * @see {@link IJwtGeneratorOptions.accessTokenSigner}
	 */
	public readonly accessTokenSigner: IAccessTokenSigner;

	/**
	 * @see {@link IJwtGeneratorOptions.millisecondsToLive}
	 */
	public readonly millisecondsToLive: number;

	public constructor (options: IJwtGeneratorOptions) {
		validateOptions(options);

		this.appId = options.appId;
		this.apiKey = options.apiKey;
		this.apiKeyId = options.apiKeyId;
		this.accessTokenSigner = options.accessTokenSigner;
		this.millisecondsToLive = options.millisecondsToLive !== undefined
			? Number(options.millisecondsToLive)
			: DEFAULT_TOKEN_TTL;
	}

	/**
	 * Generates a token with the given identity as the subject and optional
	 * additional data.
	 * @param {string} identity - Identity to be associated with JWT (i.e.
	 * the Subject).
	 * @param {IExtraData} ada - Additional data to be encoded in the JWT.
	 * @returns {Jwt}
	 */
	public generateToken(identity: string, ada?: IExtraData) {
		const iat = getUnixTimestamp(new Date());
		const exp = getUnixTimestamp(new Date().getTime() + this.millisecondsToLive);

		const body: IJwtBody = {
			iss: IssuerPrefix + this.appId,
			sub: SubjectPrefix + identity,
			iat,
			exp,
			ada
		};

		const header: IJwtHeader = {
			alg: this.accessTokenSigner.getAlgorithm(),
			kid: this.apiKeyId,
			typ: JwtContentType,
			cty: VirgilContentType
		};

		const unsignedJwt = new Jwt(header, body);
		const signature = this.accessTokenSigner.generateTokenSignature(unsignedJwt.unsignedData, this.apiKey);

		return new Jwt(header, body, signature.toString('base64'));

	}
}

function validateOptions(opts: IJwtGeneratorOptions) {
	const invalidOptionMessage = (name: keyof IJwtGeneratorOptions) =>
		`Invalid JwtGenerator options. \`${name}\` is required`;

	assert(opts != null, 'JwtGenerator options must be provided');
	assert(opts.apiKey != null, invalidOptionMessage('apiKey'));
	assert(opts.apiKeyId != null, invalidOptionMessage('apiKeyId'));
	assert(opts.appId != null, invalidOptionMessage('appId'));
	assert(opts.accessTokenSigner != null, invalidOptionMessage('accessTokenSigner'));
}
