import { fetch, Headers, Response } from '../Lib/fetch';

export class Connection {

	public constructor (private readonly prefix: string) {}

	public get (endpoint: string, jwtToken: string, params: object = {}): Promise<Response> {
		return this.send(endpoint, 'GET', params);
	}

	public post (endpoint: string, jwtToken: string, data: object = {}): Promise<Response> {
		const headers = new Headers();
		headers.append('Authorization', `Virgil ${jwtToken}`);
		headers.append('Content-Type', 'application/json');
		return this.send(endpoint, 'POST', {
			headers: headers,
			body: JSON.stringify( data )
		});
	}

	private send (endpoint: string, method: string, params: object): Promise<Response> {
		return fetch(this.prefix + endpoint, { method, ...params });
	}

}
