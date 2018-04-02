import { IExtraData } from '../../ICard';
import { base64Decode, base64Encode } from '../../Lib/base64';
import { IAccessToken } from './AccessTokenProviders';

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
	readonly iat: Date; // IssuedAt
	readonly exp: Date; // ExpiresAt
	readonly ada?: IExtraData; // AdditionalData

	//iss = IssuerPrefix + appId;
	//sub = SubjectPrefix + identity;
}

export class Jwt implements IAccessToken {
	public static fromString (jwtStr: string): Jwt {
		const parts = jwtStr.split('.');

		if (parts.length !== 3) throw new Error('Wrong JWT format');

		try {
			const headerJson = base64Decode(parts[0]).toString('utf8');
			const bodyJson   = base64Decode(parts[1]).toString('utf8');
			const signature  = base64Decode(parts[2]);

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
			this.stringRepresentation = withoutSignature + this.signatureBase64();
		}
	}

	public toString () : string {
		return this.stringRepresentation;
	}

	public headerBase64(): string {
		return base64Encode( JSON.stringify(this.header) );
	}

	public bodyBase64(): string {
		return base64Encode( JSON.stringify(this.body) );
	}

	public signatureBase64(): string {
		return base64Encode( JSON.stringify(this.signature) );
	}

	public identity (): string {
		if (!this.body.sub.startsWith(SubjectPrefix)) {
			throw new Error('wrong sub format');
		}

		return this.body.sub.substr(0, SubjectPrefix.length);
	}

	public appId (): string {
		if (!this.body.iss.startsWith(IssuerPrefix)) {
			throw new Error('wrong iss format');
		}

		return this.body.iss.substr(0, IssuerPrefix.length);
	}
}
