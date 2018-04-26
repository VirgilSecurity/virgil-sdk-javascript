import { IPrivateKey } from '../../../CryptoApi/IPrivateKey';
import { IAccessTokenSigner } from '../../../CryptoApi/IAccessTokenSigner';
import { IExtraData } from '../../ICard';
import {
	IJwtBody,
	IJwtHeader,
	IssuerPrefix,
	Jwt,
	JwtContentType,
	SubjectPrefix,
	VirgilContentType
} from './Jwt';
import { getUnixTimestamp } from '../../Lib/timestamp';
import { assert } from '../../Lib/assert';

export type JwtGeneratorOptions = {
	apiKey: IPrivateKey;
	apiKeyId: string;
	appId: string;
	accessTokenSigner: IAccessTokenSigner;
	millisecondsToLive?: number;
}

const DEFAULT_TOKEN_TTL = 20 * 60 * 1000; // 20 minutes

export class JwtGenerator {
	public readonly appId: string;
	public readonly apiKey: IPrivateKey;
	public readonly apiKeyId: string;
	public readonly accessTokenSigner: IAccessTokenSigner;
	public readonly millisecondsToLive: number;

	public constructor (options: JwtGeneratorOptions) {
		validateOptions(options);

		this.appId = options.appId;
		this.apiKey = options.apiKey;
		this.apiKeyId = options.apiKeyId;
		this.accessTokenSigner = options.accessTokenSigner;
		this.millisecondsToLive = options.millisecondsToLive !== undefined
			? Number(options.millisecondsToLive)
			: DEFAULT_TOKEN_TTL;
	}

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
		const jwtBytes = Buffer.from(unsignedJwt.toString(), 'utf8');
		const signature = this.accessTokenSigner.generateTokenSignature(jwtBytes, this.apiKey);

		return new Jwt(header, body, signature);

	}
}

function validateOptions(opts: JwtGeneratorOptions) {
	const invalidOptionMessage = (name: keyof JwtGeneratorOptions) =>
		`Invalid JwtGenerator options. \`${name}\` is required`;

	assert(opts != null, 'JwtGenerator options must be provided');
	assert(opts.apiKey != null, invalidOptionMessage('apiKey'));
	assert(opts.apiKeyId != null, invalidOptionMessage('apiKeyId'));
	assert(opts.appId != null, invalidOptionMessage('appId'));
	assert(opts.accessTokenSigner != null, invalidOptionMessage('accessTokenSigner'));
}
