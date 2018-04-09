import { Connection } from './Connection';
import { IRawSignedModelJson, RawSignedModel } from './IRawSignedModel';
import { generateErrorFromResponse } from './errors';

const PublishEndpoint = '/card/v5';
const SearchEndpoint = '/card/v5/actions/search';
const GetCardEndpoint = (cardId: string) => `/card/v5/${cardId}`;

export interface ICardResult {
	readonly cardRaw: RawSignedModel;
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

	public async searchCards (identity: string, jwtToken: string): Promise<RawSignedModel[]> {
		if (!identity) throw new TypeError('`identity` should not be empty');
		if (!jwtToken) throw new TypeError('`jwtToken` should not be empty');

		const response = await this.connection.post( SearchEndpoint, jwtToken, { identity } );

		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}

		const cardsJson = await response.json();
		if (cardsJson === null) {
			return [];
		}

		return cardsJson.map(RawSignedModel.fromJSON);
	}

	public async getCard (cardId: string, jwtToken: string): Promise<ICardResult> {
		if (!cardId)   throw new TypeError('`cardId` should not be empty');
		if (!jwtToken) throw new TypeError('`jwtToken` should not be empty');

		const response = await this.connection.get( GetCardEndpoint(cardId), jwtToken );
		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}

		const isOutdated = response.headers.get('X-Virgil-Is-Superseeded') === 'true';

		const cardJson = await response.json();
		const cardRaw = RawSignedModel.fromJSON(cardJson);

		return { cardRaw, isOutdated };
	}

	public async publishCard (model: RawSignedModel, jwtToken: string): Promise<RawSignedModel> {
		if (!model)    throw new TypeError('`model` should not be empty');
		if (!jwtToken) throw new TypeError('`jwtToken` should not be empty');

		const response = await this.connection.post( PublishEndpoint, jwtToken, model );
		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}

		const cardJson =  await response.json() as IRawSignedModelJson;
		return RawSignedModel.fromJSON(cardJson);
	}

}
