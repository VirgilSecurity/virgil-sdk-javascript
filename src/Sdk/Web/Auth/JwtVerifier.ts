import { IAccessTokenSigner } from '../../../CryptoApi/IAccessTokenSigner';
import { IPublicKey } from '../../../CryptoApi/IPublicKey';
import { Jwt, JwtContentType, VirgilContentType } from './Jwt';

export class JwtVerifier {
	public constructor (
		public readonly accessTokenSigner: IAccessTokenSigner,
		public readonly apiPublicKey: IPublicKey,
		public readonly apiPublicKeyId: string
	) {}


	public verifyToken(token: Jwt): boolean {
		if (token == null) {
			throw new Error('Token is empty');
		}

		if (!this.allFieldAreCorrect(token)) {
			return false;
		}

		return this.accessTokenSigner.verifyTokenSignature(
			token.signature, token.unsignedData, this.apiPublicKey
		);
	}

	private allFieldAreCorrect (token: Jwt): boolean {
		return token.header.kid == this.apiPublicKeyId
			&& token.header.alg == this.accessTokenSigner.getAlgorithm()
			&& token.header.cty == VirgilContentType
			&& token.header.typ == JwtContentType;
	}
}