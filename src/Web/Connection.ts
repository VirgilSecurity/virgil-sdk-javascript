import { fetch, Headers, Response } from '../lib/fetch';

/**
 * Interface to be implemented by objects capable of making HTTP requests.
 * @hidden
 */
export interface IConnection {
	get (endpoint: string, accessToken: string): Promise<Response>;
	post (endpoint: string, accessToken: string, data?: object): Promise<Response>;
}

/**
 * Class responsible for making HTTP requests.
 * @hidden
 */
export class Connection implements IConnection {

	/**
	 * Initializes a new instance of `Connection`.
	 * @param {string} prefix - `prefix` will be prepended to the `endpoint`
	 * argument of request methods.
	 */
	public constructor (private readonly prefix: string) {}

	/**
	 * Issues a GET request against the `endpoint`.
	 * @param {string} endpoint - Endpoint URL relative to the `prefix`.
	 * @param {string} accessToken - Token to authenticate the request.
	 * @returns {Promise<Response>}
	 */
	public get (endpoint: string, accessToken: string): Promise<Response> {
		const headers = this.createHeaders(accessToken);
		return this.send(endpoint, 'GET', { headers });
	}

	/**
	 * Issues a POST request against the `endpoint` sending the `data` as JSON.
	 * @param {string} endpoint - Endpoint URL relative to the `prefix`.
	 * @param {string} accessToken - Token to authenticate the request.
	 * @param {object} data - Response body.
	 * @returns {Promise<Response>}
	 */
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
