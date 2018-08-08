import { fetch, Headers, Response } from '../lib/fetch';

export interface IConnection {
	get (endpoint: string, accessToken: string): Promise<Response>;
	post (endpoint: string, accessToken: string, data?: object): Promise<Response>;
}

export class Connection implements IConnection {

	public constructor (private readonly prefix: string) {}

	public get (endpoint: string, accessToken: string): Promise<Response> {
		const headers = this.createHeaders(accessToken);
		return this.send(endpoint, 'GET', { headers });
	}

	public post (endpoint: string, accessToken: string, data: object = {}): Promise<Response> {
		const headers = this.createHeaders(accessToken);
		headers.set('Content-Type', 'application/json');
		return this.send(endpoint, 'POST', {
			headers: headers,
			body: JSON.stringify( data )
		});
	}

	private send (endpoint: string, method: string, params: object): Promise<Response> {
		return fetch(this.prefix + endpoint, { method, ...params });
	}

	private createHeaders (accessToken: string) {
		const headers = new Headers();
		headers.set('Authorization', `Virgil ${accessToken}`);
		return headers;
	}

}
