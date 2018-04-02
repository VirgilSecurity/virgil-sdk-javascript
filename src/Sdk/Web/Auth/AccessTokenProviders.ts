import { Jwt } from './Jwt';

export interface IAccessToken {
	identity(): string;
	toString(): string;
}

export interface ITokenContext {
	readonly identity: string;
	readonly operation: string;
	readonly forceReload: boolean;
}

export interface IAccessTokenProvider {
	getToken(context: ITokenContext): Promise<IAccessToken>;
}

export class ConstAccessTokenProvider implements IAccessTokenProvider {
	public constructor (private readonly accessToken: IAccessToken) {};

	public async getToken(context: ITokenContext): Promise<IAccessToken> {
		return Promise.resolve(this.accessToken);
	}
}

export type JwtCallback = (context: ITokenContext) => Promise<string>;

export class CallbackJwtProvider implements IAccessTokenProvider {
	public constructor (private readonly obtainTokenFunc: JwtCallback) {};

	public async getToken(context: ITokenContext): Promise<IAccessToken> {
		return Jwt.fromString(await this.obtainTokenFunc(context));
	}
}