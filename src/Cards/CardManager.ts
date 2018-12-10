import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IRawSignedModelJson, RawSignedModel } from './RawSignedModel';
import { CardClient } from '../Client/CardClient';
import { ModelSigner } from './ModelSigner';
import { ICard, INewCardParams, IRawCardContent } from './ICard';
import { ICardVerifier } from './CardVerifier';
import { IAccessToken, IAccessTokenProvider, ITokenContext } from '../Auth/AccessTokenProviders';
import { cardToRawSignedModel, generateRawSigned, linkedCardList, parseRawSignedModel } from './CardUtils';
import { assert } from '../Lib/assert';
import { VirgilCardVerificationError } from './errors';
import { VirgilHttpError, ErrorCode } from '../Client/errors';
import { SelfSigner } from './constants';

/**
 * @hidden
 */
const throwingAccessTokenProvider: IAccessTokenProvider = {
	getToken: () => { throw new Error(
		'Please set `CardManager.accessTokenProvider` to be able to make requests.'
	); }
};

/**
 * User-specified callback function to be called just before publishing
 * a Virgil Card to append additional signatures to it.
 *
 * Receives a single parameter of type {@link RawSignedModel} and must
 * return a {@link RawSignedModel} with additional signatures.
 * Use {@link ModelSigner} to add signatures.
 */
export type ISignCallback = (model: RawSignedModel) => Promise<RawSignedModel> | RawSignedModel;

/**
 * {@link CardManager} initialization options.
 */
export interface ICardManagerParams {

	/**
	 * Implementation of {@link IAccessTokenProvider} to use to
	 * get the token for requests authentication. Optional.
	 */
	readonly accessTokenProvider?: IAccessTokenProvider;

	/**
	 * Implementation of {@link ICardCrypto} interface.
	 */
	readonly cardCrypto: ICardCrypto;

	/**
	 * Implementation of {@link ICardVerifier} interface to
	 * be used to verify the validity of Virgil Cards received
	 * from network and via {@link CardManager.importCard} method.
	 */
	readonly cardVerifier: ICardVerifier;

	/**
	 * Alters the behavior of the `CardManager` when it receives an
	 * HTTP Unauthorized (401) error from the server. If this is set to
	 * `true` it will silently request a new token form the
	 * {@link CardManager.accessTokenProvider} and re-send the request,
	 * otherwise the error will be returned to the client.
	 */
	readonly retryOnUnauthorized: boolean;

	/**
	 * Optional {@link ISignCallback}.
	 */
	readonly signCallback?: ISignCallback;

	/**
	 * Virgil Services API URL. Optional.
	 * @hidden
	 */
	readonly apiUrl?: string;
}

/**
 * Class responsible for creating, publishing and retrieving Virgil Cards.
 */
export class CardManager {
	public readonly crypto: ICardCrypto;
	public readonly client: CardClient;
	public readonly modelSigner: ModelSigner;
	public readonly signCallback?: ISignCallback;
	public readonly cardVerifier: ICardVerifier;
	public retryOnUnauthorized: boolean;

	public accessTokenProvider: IAccessTokenProvider;

	public constructor (params: ICardManagerParams) {
		this.crypto = params.cardCrypto;
		this.client = new CardClient(params.apiUrl);
		this.modelSigner = new ModelSigner(params.cardCrypto);
		this.signCallback = params.signCallback;
		this.retryOnUnauthorized = params.retryOnUnauthorized;
		this.cardVerifier = params.cardVerifier;
		this.accessTokenProvider = params.accessTokenProvider || throwingAccessTokenProvider;
	}

	/**
	 * Generates a {@link RawSignedModel} that represents a card from
	 * `cardParams`.
	 * Use this method if you don't need to publish the card right away, for
	 * example if you need to first send it to your backend server to apply
	 * additional signature.
	 *
	 * @param {INewCardParams} cardParams - New card parameters.
	 * @returns {RawSignedModel}
	 */
	generateRawCard(cardParams: INewCardParams): RawSignedModel {
		const model = generateRawSigned(this.crypto, cardParams);

		this.modelSigner.sign({
			model,
			signerPrivateKey: cardParams.privateKey,
			signer: SelfSigner,
			extraFields: cardParams.extraFields
		});

		return model;
	}

	/**
	 * Generates a card from `cardParams` and publishes it in the Virgil Cards
	 * Service.
	 * @param {INewCardParams} cardParams - New card parameters.
	 * @returns {Promise<ICard>}
	 */
	async publishCard(cardParams: INewCardParams) {
		validateCardParams(cardParams);
		const tokenContext: ITokenContext = { identity: cardParams.identity, operation: 'publish' };
		const token = await this.accessTokenProvider.getToken(tokenContext);
		const rawSignedModel = this.generateRawCard(
			Object.assign({}, cardParams, { identity: token.identity() })
		);

		return await this.publishRawSignedModel(rawSignedModel, tokenContext, token);
	}

	/**
	 * Publishes a previously generated card in the form of
	 * {@link RawSignedModel} object.
	 *
	 * @param {RawSignedModel} rawCard - The card to publish.
	 * @returns {Promise<ICard>}
	 */
	async publishRawCard(rawCard: RawSignedModel) {
		assert(rawCard != null && rawCard.contentSnapshot != null, '`rawCard` should not be empty');
		const cardDetails = JSON.parse(rawCard.contentSnapshot) as IRawCardContent;
		const tokenContext: ITokenContext = { identity: cardDetails.identity, operation: 'publish' };
		const token = await this.accessTokenProvider.getToken(tokenContext);

		return this.publishRawSignedModel(rawCard, tokenContext, token);
	}

	/**
	 * Fetches the card by `cardId` from the Virgil Card Service.
	 * @param {string} cardId - Id of the card to fetch.
	 * @returns {Promise<ICard>}
	 */
	async getCard(cardId: string): Promise<ICard> {
		const tokenContext: ITokenContext = { operation: 'get' };

		const accessToken = await this.accessTokenProvider.getToken(tokenContext);
		const cardWithStatus = await this.tryDo(tokenContext, accessToken,
			async (token) => await this.client.getCard(cardId, token.toString()));

		const card = parseRawSignedModel( this.crypto, cardWithStatus.cardRaw, cardWithStatus.isOutdated );

		if (card.id !== cardId) {
			throw new VirgilCardVerificationError('Received invalid card');
		}

		this.validateCards([ card ]);
		return card;
	}

	/**
	 * Fetches collection of cards with the given `identity` from the Virgil
	 * Cards Service.
	 * @param {string|string[]} identities - Identity or an array of identities of the cards to fetch.
	 * @returns {Promise<ICard[]>}
	 */
	async searchCards (identities: string|string[]): Promise<ICard[]> {
		if (!identities) throw new TypeError('Argument `identities` is required');

		const identitiesArr = Array.isArray(identities) ? identities : [identities];
		if (identitiesArr.length === 0) throw new TypeError('Identities array must not be empty');

		const tokenContext: ITokenContext = { operation: 'search' };
		const accessToken = await this.accessTokenProvider.getToken(tokenContext);
		const rawCards = await this.tryDo(
			tokenContext,
			accessToken,
			async (token) => await this.client.searchCards(identitiesArr, token.toString())
		);

		const cards = rawCards.map(raw => parseRawSignedModel(this.crypto, raw, false));
		const identitiesSet = new Set(identitiesArr);

		if (cards.some(c => !identitiesSet.has(c.identity))) {
			throw new VirgilCardVerificationError('Received invalid cards');
		}

		this.validateCards(cards);
		return linkedCardList(cards);
	}

	/**
	 * Converts the card in the form of {@link RawSignedModel} object to the
	 * {@link ICard} object.
	 *
	 * @see {@link CardManager.exportCard}
	 *
	 * @param {RawSignedModel} rawCard - The card to convert.
	 * @returns {ICard}
	 */
	importCard (rawCard: RawSignedModel): ICard {
		const card = parseRawSignedModel( this.crypto, rawCard );
		this.validateCards([ card ]);
		return card;
	}

	/**
	 * Converts the card in the base64 string form to the {@link ICard} object.
	 *
	 * @see {@link CardManager.exportCardAsString}
	 *
	 * @param {string} str - The string in base64.
	 * @returns {ICard}
	 */
	importCardFromString (str: string): ICard {
		assert(Boolean(str), '`str` should not be empty');
		return this.importCard( RawSignedModel.fromString(str) );
	}

	/**
	 * Converts the card in the JSON-serializable object form to the
	 * {@link ICard} object.
	 *
	 * @see {@link CardManager.exportCardAsJson}
	 *
	 * @param {IRawSignedModelJson} json
	 * @returns {ICard}
	 */
	importCardFromJson (json: IRawSignedModelJson): ICard {
		assert(Boolean(json), '`json` should not be empty');
		return this.importCard( RawSignedModel.fromJson(json) );
	}

	/**
	 * Converts the card in the form of {@link ICard} object to the
	 * {@link RawSignedModel} object.
	 *
	 * @see {@link CardManager.importCard}
	 *
	 * @param {ICard} card
	 * @returns {RawSignedModel}
	 */
	exportCard (card: ICard): RawSignedModel {
		return cardToRawSignedModel(card);
	}

	/**
	 * Converts the card in the form of {@link ICard} object to the string
	 * in base64 encoding.
	 *
	 * @see {@link CardManager.importCardFromString}
	 *
	 * @param {ICard} card
	 * @returns {string}
	 */
	exportCardAsString (card: ICard): string {
		return this.exportCard(card).toString();
	}

	/**
	 * Converts the card in the form of {@link ICard} object to the
	 * JSON-serializable object form.
	 *
	 * @see {@link CardManager.importCardFromJson}
	 *
	 * @param {ICard} card
	 * @returns {IRawSignedModelJson}
	 */
	exportCardAsJson (card: ICard): IRawSignedModelJson {
		return this.exportCard(card).toJson();
	}

	/**
	 * @hidden
	 */
	private async publishRawSignedModel (rawCard: RawSignedModel, context: ITokenContext, accessToken: IAccessToken): Promise<ICard> {
		if (this.signCallback != null) {
			rawCard = await this.signCallback(rawCard);
		}

		const publishedModel = await this.tryDo(
			context,
			accessToken,
			async token => await this.client.publishCard(rawCard, token.toString())
		);

		if (rawCard.contentSnapshot !== publishedModel.contentSnapshot) {
			throw new VirgilCardVerificationError('Received invalid card');
		}

		const card = parseRawSignedModel(this.crypto, publishedModel);
		this.validateCards([ card ]);
		return card;
	}

	/**
	 * @hidden
	 */
	private async tryDo<T> (context: ITokenContext, token: IAccessToken, func: (token: IAccessToken) => Promise<T>): Promise<T> {
		try {
			return await func(token);
		} catch (e) {
			if (
				e instanceof VirgilHttpError &&
				e.httpStatus === 401 &&
				e.errorCode === ErrorCode.AccessTokenExpired &&
				this.retryOnUnauthorized
			) {
				token = await this.accessTokenProvider.getToken({
					identity: context.identity,
					operation: context.operation,
					forceReload: true
				});

				return await func(token);
			}

			throw e;
		}
	}

	/**
	 * Delegates to the {@link CardManager.cardVerifier} to verify the validity
	 * of the `cards`.
	 *
	 * @throws {@link VirgilCardVerificationError} if any of the cards is not
	 * valid.
	 *
	 * @param {ICard[]} cards
	 */
	private validateCards(cards: ICard[]) {
		if (this.cardVerifier == null) return;

		for (const card of cards) {
			if (!this.cardVerifier.verifyCard(card)) {
				throw new VirgilCardVerificationError('Validation errors have been detected');
			}
		}
	}
}

/**
 * @hidden
 */
function validateCardParams(params: INewCardParams, validateIdentity: boolean = false) {
	assert(params != null, 'Card parameters must be provided');
	assert(params.privateKey != null, 'Card\'s private key is required');
	assert(params.publicKey != null, 'Card\'s public key is required');
	if (validateIdentity) {
		assert(
			typeof params.identity === 'string' && params.identity !== '',
			'Card\'s identity is required'
		);
	}
}
