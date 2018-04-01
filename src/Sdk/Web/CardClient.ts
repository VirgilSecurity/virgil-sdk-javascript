import { Connection } from './Connection';
import { IRawSignedModel } from './IRawSignedModel';

const PublishEndpoint = "/card/v5";
const SearchEndpoint = "/card/v5/actions/search";
const GetCardEndpoint = (cardId: string) => `/card/v5/${cardId}`;

export interface ICardResult {
	readonly cardRaw: IRawSignedModel;
	readonly isOutdated: boolean;
}

export class CardClient {
	private readonly connection: Connection;

	public constructor (connection: Connection|string|undefined) {
		if (typeof connection === 'string') {
			this.connection = new Connection(connection)
		} else if (connection) {
			this.connection = connection;
		} else {
			this.connection = new Connection('https://api.virgilsecurity.com');
		}
	}

	public async searchCards (identity: string, jwtToken: string): Promise<IRawSignedModel[]> {
		if (!identity) throw new TypeError("`identity` should not be empty");
		if (!jwtToken) throw new TypeError("`jwtToken` should not be empty");

		const response = await this.connection.post( SearchEndpoint, jwtToken, { identity } );

		return response.json() as Promise<IRawSignedModel[]>;
	}

	public async getCard (cardId: string, jwtToken: string): Promise<ICardResult> {
		if (!cardId)   throw new TypeError("`cardId` should not be empty");
		if (!jwtToken) throw new TypeError("`jwtToken` should not be empty");

		const response = await this.connection.get( GetCardEndpoint(cardId), jwtToken );
		const isOutdated = response.headers.get('X-Virgil-Is-Superseeded') === 'true';

		const cardRaw = await response.json() as IRawSignedModel;

		return { cardRaw, isOutdated };
	}

	public async publishCard (model: IRawSignedModel, jwtToken: string): Promise<IRawSignedModel> {
		if (!model)    throw new TypeError("`model` should not be empty");
		if (!jwtToken) throw new TypeError("`jwtToken` should not be empty");

		// what is correct way to serialize model?
		const response = await this.connection.post( PublishEndpoint, jwtToken, model );

		return response.json() as Promise<IRawSignedModel>;
	}

}