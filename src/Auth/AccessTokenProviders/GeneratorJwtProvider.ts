import { JwtGenerator } from '../JwtGenerator';
import { IAccessToken, IAccessTokenProvider, ITokenContext } from './interfaces';
import { IExtraData } from '../../Cards/ICard';

/**
 * Implementation of {@link IAccessTokenProvider} that generates a
 * new JWT whenever it is requested by the clients.
 *
 * This class is meant to be used on the server side only.
 */
export class GeneratorJwtProvider implements IAccessTokenProvider {
	/**
	 * Creates a new instance of `GeneratorJwtProvider` with the given
	 * {@link JwtGenerator}, additional data and default identity.
	 *
	 * @param {JwtGenerator} jwtGenerator - Object to delegate the JWT generation to.
	 * @param {IExtraData} additionalData - Additional data to include with the JWT.
	 * @param {string} defaultIdentity - Identity of the user to include in the token
	 * when none is provided explicitly by the client.
	 */
	constructor(
		private readonly jwtGenerator: JwtGenerator,
		private readonly additionalData?: IExtraData,
		private readonly defaultIdentity?: string
	) {
		if (jwtGenerator == null) {
			throw new TypeError('`jwtGenerator` is required');
		}
	}

	/**
	 * Returns a `Promise` fulfilled with the JWT obtained from the call
	 * to {@link GeneratorJwtProvider.jwtGenerator} {@link JwtGenerator.generateToken}
	 * method, passing it the {@link GeneratorJwtProvider.additionalData} and
	 * {@link GeneratorJwtProvider.defaultIdentity}
	 *
	 * @param {ITokenContext} context
	 * @returns {Promise<IAccessToken>}
	 */
	getToken(context: ITokenContext): Promise<IAccessToken> {
		return Promise.resolve().then(() => {
			const jwt = this.jwtGenerator.generateToken(
				context.identity || this.defaultIdentity || '',
				this.additionalData
			);

			return jwt;
		});
	}
}
