import { Connection, IConnection, IProductInfo} from './Connection';
import { RawSignedModel } from '../Cards/RawSignedModel';
import { generateErrorFromResponse } from './errors';

const PublishEndpoint = '/card/v5';
const SearchEndpoint = '/card/v5/actions/search';
const GetCardEndpoint = (cardId: string) => `/card/v5/${cardId}`;
const RevokeCardEndpoint = (cardId: string) => `/card/v5/actions/revoke/${cardId}`;

/**
 * @hidden
 */
export interface ICardResult {
	readonly cardRaw: RawSignedModel;
	readonly isOutdated: boolean;
}

/**
 * Class responsible for sending requests to the Virgil Cards Service.
 *
 * @hidden
 */
export class CardClient {
	private readonly connection: IConnection;

	/**
	 * Initializes new instance of `CardClient`.
	 * @param {IConnection | string} connection - Object implementing the
	 * {@link IConnection} interface.
	 */
	public constructor (connection?: IConnection|string, productInfo?: IProductInfo) {
		if (typeof connection === 'string') {
			this.connection = new Connection(connection, productInfo)
		} else if (connection) {
			this.connection = connection;
		} else {
			this.connection = new Connection('https://api.virgilsecurity.com', productInfo);
		}
	}

	/**
	 * Issues a request to search cards by the `identity`.
	 * @param {string[]} identities - Array of identities to search for.
	 * @param {string} accessToken - A token to authenticate the request.
	 * @returns {Promise<RawSignedModel[]>}
	 */
	public async searchCards (identities: string[], accessToken: string): Promise<RawSignedModel[]> {
		const response = await this.connection.post( SearchEndpoint, accessToken, { identities } );
		if (!response.ok) throw await generateErrorFromResponse(response);

		const cardsJson = await response.json();
		if (cardsJson === null) return [];

		return cardsJson.map(RawSignedModel.fromJson);
	}

	/**
	 * Issues a request to get the card by id.
	 * @param {string} cardId - Id of the card to fetch.
	 * @param {string} accessToken - A token to authenticate the request.
	 * @returns {Promise<ICardResult>}
	 */
	public async getCard (cardId: string, accessToken: string): Promise<ICardResult> {
		if (!cardId)   throw new TypeError('`cardId` should not be empty');
		if (!accessToken) throw new TypeError('`accessToken` should not be empty');

		const response = await this.connection.get( GetCardEndpoint(cardId), accessToken );
		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}

		const isOutdated = response.headers.get('X-Virgil-Is-Superseeded') === 'true';

		const cardJson = await response.json();
		const cardRaw = RawSignedModel.fromJson(cardJson);

		return { cardRaw, isOutdated };
	}

	/**
	 * Issues a request to publish the card.
	 * @param {RawSignedModel} model - Card to publish.
	 * @param {string} accessToken - A token to authenticate the request.
	 * @returns {Promise<RawSignedModel>}
	 */
	public async publishCard (model: RawSignedModel, accessToken: string): Promise<RawSignedModel> {
		if (!model)    throw new TypeError('`model` should not be empty');
		if (!accessToken) throw new TypeError('`accessToken` should not be empty');

		const response = await this.connection.post( PublishEndpoint, accessToken, model );
		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}

		const cardJson = await response.json();
		return RawSignedModel.fromJson(cardJson);
	}

	public async revokeCard (cardId: string, accessToken: string): Promise<void> {
		if (!cardId) throw new TypeError('`cardId` should not be empty');
		if (!accessToken) throw new TypeError('`accessToken` should not be empty');

		const response = await this.connection.post(RevokeCardEndpoint(cardId), accessToken);
		if (!response.ok) {
			throw await generateErrorFromResponse(response);
		}
	}
}
