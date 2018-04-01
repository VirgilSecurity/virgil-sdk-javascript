import { IPrivateKey } from '../../../CryptoApi/IPrivateKey';
import { IAccessTokenSigner } from '../../../CryptoApi/IAccessTokenSigner';
import { IExtraData } from '../../ICard';
import {
	IJwtBody,
	IJwtHeader,
	IssuerPrefix, Jwt,
	JwtContentType,
	SubjectPrefix,
	VirgilContentType
} from './Jwt';

export class JwtGenerator {
	public constructor (
		public readonly appId: string,
		public readonly apiKey: IPrivateKey,
		public readonly lifeTime: number,
		public readonly apiPublicKeyId: string,
		public readonly accessTokenSigner: IAccessTokenSigner,
	) {}

	public generateToken(identity: string, ada?: IExtraData) {
		const now = Date.now();

		// todo: correct time!
		const iat = new Date; // var issuedAt = timeNow.AddTicks(-timeNow.Ticks % TimeSpan.TicksPerSecond);
		const exp = new Date; // var expiresAt = issuedAt.AddMilliseconds(LifeTime.TotalMilliseconds);

		const body: IJwtBody = {
			iss: IssuerPrefix + this.appId,
			sub: SubjectPrefix + identity,
			iat, exp, ada
		};

		const header: IJwtHeader = {
			alg: this.accessTokenSigner.getAlgorithm(),
			kid: this.apiPublicKeyId,
			typ: JwtContentType,
			cty: VirgilContentType
		};

		const unsignedJwt = new Jwt(header, body);
		const jwtBytes = Buffer.from(unsignedJwt.toString(), 'utf8');
		const signature = this.accessTokenSigner.generateTokenSignature(jwtBytes, this.apiKey);

		return new Jwt(header, body, signature);

	}
}