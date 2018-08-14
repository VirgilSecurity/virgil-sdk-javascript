import { GetJwtCallback, Jwt } from '../Jwt';
import { IAccessToken, IAccessTokenProvider, ITokenContext } from './interfaces';

/**
 * Implementation of {@link IAccessToken} that calls the user-provided
 * callback function to get the JWT when requested by the clients.
 */
export class CallbackJwtProvider implements IAccessTokenProvider {
	private readonly getJwt: (tokenContext: ITokenContext) => Promise<Jwt>;

	/**
	 * Creates a new instance of `CallbackJwtProvider`.
	 *
	 * @param {GetJwtCallback} getJwtFn - The function that will be called
	 * whenever the JWT is needed. If the `getJwtFn` returns the JWT as a
	 * string, it will be converted to {@link Jwt} instance automatically.
	 */
	public constructor (getJwtFn: GetJwtCallback) {
		if (typeof getJwtFn !== 'function') {
			throw new TypeError('`getJwtFn` must be a function');
		}

		this.getJwt = (context: ITokenContext) =>
			Promise.resolve(getJwtFn(context))
				.then(token => typeof token === 'string' ? Jwt.fromString(token) : token);
	}

	/**
	 * Returns a `Promise` resolved with the {@link Jwt} instance obtained
	 * by the call to the {@link CallbackJwtProvider.getJwt}. If the
	 * `getJwtFn` returns the JWT as a string, it is converted to
	 * {@link Jwt} instance before returning.
	 *
	 * @param {ITokenContext} context
	 * @returns {Promise<IAccessToken>}
	 */
	public getToken(context: ITokenContext): Promise<IAccessToken> {
		return this.getJwt(context);
	}
}
