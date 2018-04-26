import { IExtraData } from '../../ICard';
import { base64UrlDecode, base64UrlEncode } from '../../Lib/base64';
import { IAccessToken } from './AccessTokenProviders';
import { getUnixTimestamp } from '../../Lib/timestamp';

export const SubjectPrefix = "identity-";
export const IssuerPrefix = "virgil-";

export const VirgilContentType = "virgil-jwt;v=1";
export const JwtContentType = "JWT";

export interface IJwtHeader {
	readonly alg: string; // Algorithm
	readonly typ: string; // Type
	readonly cty: string; // ContentType
	readonly kid: string; // KeyId
}

export interface IJwtBody {
	readonly iss: string; // Issuer.
	readonly sub: string; // Subject
	readonly iat: number; // IssuedAt
	readonly exp: number; // ExpiresAt
	readonly ada?: IExtraData; // AdditionalData
}

export class Jwt implements IAccessToken {
	public static fromString (jwtStr: string): Jwt {
		const parts = jwtStr.split('.');

		if (parts.length !== 3) throw new Error('Wrong JWT format');

		try {
			const headerJson = base64UrlDecode(parts[0]).toString('utf8');
			const bodyJson   = base64UrlDecode(parts[1]).toString('utf8');
			const signature  = base64UrlDecode(parts[2]);

			const header = JSON.parse(headerJson);
			const body   = JSON.parse(bodyJson);

			return new Jwt(header, body, signature);
		} catch (e) {
			throw new Error('Wrong JWT format');
		}
	}

	public readonly unsignedData: Buffer;
	private readonly stringRepresentation: string;

	constructor (
		public readonly header: IJwtHeader,
		public readonly body  : IJwtBody,
		public readonly signature?: Buffer
	) {
		const withoutSignature = this.headerBase64() + '.' + this.bodyBase64();

		this.unsignedData = Buffer.from(withoutSignature, 'utf8');

		if (this.signature == null) {
			this.stringRepresentation = withoutSignature;
		} else {
			this.stringRepresentation = withoutSignature + '.' + this.signatureBase64();
		}
	}

	public toString () : string {
		return this.stringRepresentation;
	}

	public identity(): string {
		if (this.body.sub.indexOf(SubjectPrefix) !== 0) {
			throw new Error('wrong sub format');
		}

		return this.body.sub.substr(SubjectPrefix.length);
	}

	public appId(): string {
		if (this.body.iss.indexOf(IssuerPrefix) !== 0) {
			throw new Error('wrong iss format');
		}

		return this.body.iss.substr(IssuerPrefix.length);
	}

	public isExpired (): boolean {
		const now = getUnixTimestamp(new Date);
		return this.body.exp < now;
	}

	private headerBase64(): string {
		return base64UrlEncode( JSON.stringify(this.header) );
	}

	private bodyBase64(): string {
		return base64UrlEncode( JSON.stringify(this.body) );
	}

	private signatureBase64(): string {
		return base64UrlEncode( this.signature! );
	}
}
