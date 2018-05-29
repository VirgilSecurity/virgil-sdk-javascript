import { Jwt } from '../Jwt';

/**
 * Interface for objects that represent API Access Tokens.
 */
export interface IAccessToken {
	/**
	 * Retrieves user's identity from the token.
	 * @returns {string}
	 */
	identity(): string;

	/**
	 * Returns the string representation of the token.
	 * @returns {string}
	 */
	toString(): string;
}

/**
 * Interface for objects that provide context to the
 * {@link IAccessTokenProvider} implementations, i.e. which operation
 * is being performed, identity of the user performing the operation
 * and whether to force a new token to be retrieved in case the tokens
 * are being cached by the provider.
 */
export interface ITokenContext {
	/**
	 * Identity of the user performing the operation that
	 * requires Access Token. May be `undefined`.
	 */
	readonly identity?: string;

	/**
	 * Name of the operation that requires an Access Token.
	 */
	readonly operation: string;

	/**
	 * Indicates whether to force a new token to be retrieved in case the
	 * tokens are being cached by the provider.
	 */
	readonly forceReload?: boolean;
}

/**
 * Interface to be implemented by classes able to provide API
 * Access Tokens asynchronously.
 */
export interface IAccessTokenProvider {
	/**
	 * Provides an API Access Token asynchronously.
	 *
	 * @param {ITokenContext} context - The context object describing the
	 * operation for which the token is needed.
	 *
	 * @returns {Promise<IAccessToken>}
	 */
	getToken(context: ITokenContext): Promise<IAccessToken>;
}

/**
 * The callback function used to get the JWT as either `string`, or {@Link Jwt} instance
 * synchronously or asynchronously.
 */
export type GetJwtCallback = (context: ITokenContext) => Promise<Jwt|string> | Jwt | string;
