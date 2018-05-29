import { IAccessToken, IAccessTokenProvider, ITokenContext } from './interfaces';

/**
 * Implementation of {@link IAccessTokenProvider} that returns a
 * user-provided constant access token whenever it is requested by the clients.
 */
export class ConstAccessTokenProvider implements IAccessTokenProvider {
	/**
	 * Creates a new instance of `ConstAccessTokenProvider`
	 * @param {IAccessToken} accessToken - The access token to be returned
	 * whenever it is requested.
	 */
	public constructor (private readonly accessToken: IAccessToken) {
		if (accessToken == null) {
			throw new TypeError('`accessToken` is required');
		}
	};

	/**
	 * Returns a `Promise` fulfilled with the
	 * {@link ConstAccessTokenProvider.accessToken} provided to the constructor
	 * of this instance.
	 *
	 * @param {ITokenContext} context
	 * @returns {Promise<IAccessToken>}
	 */
	public getToken(context: ITokenContext): Promise<IAccessToken> {
		return Promise.resolve(this.accessToken);
	}
}
