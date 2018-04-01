export class Connection {

	public constructor (private readonly prefix: string) {}

	public get (endpoint: string, jwtToken: string, params: object = {}): Promise<Response> {
		return this.send(endpoint, 'GET', params);
	}

	public post (endpoint: string, jwtToken: string, params: object = {}): Promise<Response> {
		return this.send(endpoint, 'POST', params);
	}

	private send (endpoint: string, method: string, params: object): Promise<Response> {
		return fetch(this.prefix + endpoint, { method, ...params });
	}

}