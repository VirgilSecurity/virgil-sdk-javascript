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