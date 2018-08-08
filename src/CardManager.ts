import { ICardCrypto } from './CryptoApi/ICardCrypto';
import { RawSignedModel, IRawSignedModelJson } from './Web/RawSignedModel';
import { CardClient } from './Web/CardClient';
import { ModelSigner } from './Web/ModelSigner';
import { ICard, INewCardParams, IRawCardContent } from './ICard';
import { ICardVerifier } from './CardVerifier';
import { IAccessToken, IAccessTokenProvider, ITokenContext } from './Web/Auth/AccessTokenProviders/index';
import { linkedCardList, parseRawSignedModel } from './Utils/CardUtils';
import { cardToRawSignedModel, generateRawSigned } from './Utils/RawSignedModelUtils';
import { assert } from './lib/assert';
import { VirgilCardVerificationError, VirgilHttpError } from './Web/errors';
import { parseSnapshot } from './Utils/SnapshotUtils';

export type ISignCallback = (model: RawSignedModel) => Promise<RawSignedModel>;

export interface ICardManagerParams {
	readonly cardCrypto: ICardCrypto;
	readonly signCallback?: ISignCallback;
	readonly apiUrl?: string;
	readonly retryOnUnauthorized: boolean;
	readonly cardVerifier: ICardVerifier;
	readonly accessTokenProvider: IAccessTokenProvider;
}

export class CardManager {
	public readonly crypto: ICardCrypto;
	public readonly client: CardClient;
	public readonly modelSigner: ModelSigner;
	public readonly signCallback?: ISignCallback;
	public readonly cardVerifier: ICardVerifier;
	public retryOnUnauthorized: boolean;

	public readonly accessTokenProvider: IAccessTokenProvider;

	public constructor (params: ICardManagerParams) {
		this.crypto = params.cardCrypto;
		this.client = new CardClient(params.apiUrl);
		this.modelSigner = new ModelSigner(params.cardCrypto);
		this.signCallback = params.signCallback;
		this.retryOnUnauthorized = params.retryOnUnauthorized;
		this.cardVerifier = params.cardVerifier;
		this.accessTokenProvider = params.accessTokenProvider;
	}

	generateRawCard(params: INewCardParams): RawSignedModel {
		const model = generateRawSigned(this.crypto, params);

		this.modelSigner.sign({
			model,
			signerPrivateKey: params.privateKey,
			signer: 'self',
			extraFields: params.extraFields
		});

		return model;
	}

	async publishCard(cardParams: INewCardParams) {
		validateCardParams(cardParams);
		const tokenContext: ITokenContext = { identity: cardParams.identity, operation: 'publish' };
		const token = await this.accessTokenProvider.getToken(tokenContext);
		const rawSignedModel = this.generateRawCard(
			Object.assign({}, cardParams, { identity: token.identity() })
		);

		return await this.publishRawSignedModel(rawSignedModel, tokenContext, token);
	}

	async publishRawCard(rawCard: RawSignedModel) {
		assert(rawCard != null && rawCard.contentSnapshot != null, '`rawCard` should not be empty');
		const cardDetails = parseSnapshot<IRawCardContent>(rawCard.contentSnapshot);
		const tokenContext: ITokenContext = { identity: cardDetails.identity, operation: 'publish' };
		const token = await this.accessTokenProvider.getToken(tokenContext);

		return this.publishRawSignedModel(rawCard, tokenContext, token);
	}

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

	async searchCards (identity: string): Promise<ICard[]> {
		const tokenContext: ITokenContext = { operation: 'search' };

		const accessToken = await this.accessTokenProvider.getToken(tokenContext);
		const rawCards = await this.tryDo(tokenContext, accessToken,
			async (token) => await this.client.searchCards(identity, token.toString()));

		const cards = rawCards.map(raw => parseRawSignedModel(this.crypto, raw, false));

		if (cards.some(c => c.identity !== identity)) {
			throw new VirgilCardVerificationError('Received invalid cards');
		}

		this.validateCards(cards);
		const linkedCards = linkedCardList(cards);
		return linkedCards;
	}

	importCard (rawCard: RawSignedModel): ICard {
		const card = parseRawSignedModel( this.crypto, rawCard );
		this.validateCards([ card ]);
		return card;
	}

	importCardFromString (str: string): ICard {
		assert(Boolean(str), '`str` should not be empty');
		return this.importCard( RawSignedModel.fromString(str) );
	}

	importCardFromJson (json: IRawSignedModelJson): ICard {
		assert(Boolean(json), '`json` should not be empty');
		return this.importCard( RawSignedModel.fromJson(json) );
	}

	exportCard (card: ICard): RawSignedModel {
		return cardToRawSignedModel(this.crypto, card);
	}

	exportCardAsString (card: ICard): string {
		return cardToRawSignedModel(this.crypto, card).exportAsString();
	}

	exportCardAsJson (card: ICard): IRawSignedModelJson {
		return cardToRawSignedModel(this.crypto, card).exportAsJson();
	}

	private async publishRawSignedModel (rawCard: RawSignedModel, context: ITokenContext, accessToken: IAccessToken): Promise<ICard> {
		if (this.signCallback != null) {
			rawCard = await this.signCallback(rawCard);
		}

		const publishedModel = await this.tryDo(
			context,
			accessToken,
			async token => await this.client.publishCard(rawCard, token.toString())
		);

		if (!rawCard.contentSnapshot.equals(publishedModel.contentSnapshot)) {
			throw new VirgilCardVerificationError('Received invalid card');
		}

		const card = parseRawSignedModel(this.crypto, publishedModel);
		this.validateCards([ card ]);
		return card;
	}

	private async tryDo<T> (context: ITokenContext, token: IAccessToken, func: (token: IAccessToken) => Promise<T>): Promise<T> {
		try {
			return await func(token);
		} catch (e) {
			if (e instanceof VirgilHttpError && e.httpStatus === 401 && this.retryOnUnauthorized) {
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

	private validateCards(cards: ICard[]) {
		if (this.cardVerifier == null) return;

		for (const card of cards) {
			if (!this.cardVerifier.verifyCard(card)) {
				throw new VirgilCardVerificationError('Validation errors have been detected');
			}
		}
	}
}

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
