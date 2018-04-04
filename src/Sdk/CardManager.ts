import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IRawSignedModel } from './Web/IRawSignedModel';
import { CardClient } from './Web/CardClient';
import { ModelSigner } from './Web/ModelSigner';
import { ICard } from './ICard';
import { CardVerificationError, ICardVerifier } from './CardVerifier';
import { IAccessToken, IAccessTokenProvider, ITokenContext } from './Web/Auth/AccessTokenProviders';
import { IAccessTokenSigner } from '../CryptoApi/IAccessTokenSigner';
import { TokContext } from 'acorn';
import { parseRawSignedModel } from './Utils/CardUtils';
import { deepEqual } from 'assert';
import {
	cardToRawSignedModel,
	generateRawSignedFromJson,
	generateRawSignedFromString
} from './Utils/RawSignedModelUtils';

export type ISignCallback =  (model: IRawSignedModel) => Promise<IRawSignedModel>;

export interface ICardManagerParams {
	readonly cardCrypto: ICardCrypto;
	readonly signCallback: ISignCallback;
	readonly apiUrl?: string;
	readonly retryOnUnauthorized: boolean;
	readonly verifier: ICardVerifier;
	readonly accessTokenProvider: IAccessTokenProvider;
}

export class CardManager {
	public readonly crypto: ICardCrypto;
	public readonly client: CardClient;
	public readonly modelSigner: ModelSigner;
	public readonly signCallback: ISignCallback;
	public readonly retryOnUnauthorized: boolean;
	public readonly verifier: ICardVerifier;

	public readonly accessTokenProvider: IAccessTokenProvider;

	public constructor (params: ICardManagerParams) {
		this.crypto = params.cardCrypto;
		this.client = new CardClient(params.apiUrl);
		this.modelSigner = new ModelSigner(params.cardCrypto);
		this.signCallback = params.signCallback;
		this.retryOnUnauthorized = params.retryOnUnauthorized;
		this.verifier = params.verifier;
		this.accessTokenProvider = params.accessTokenProvider;
	}

	generateRawCard() {

	}

	async publishRawCard (rawCard: IRawSignedModel, context: ITokenContext, accessToken: IAccessToken): Promise<ICard> {
		if (this.signCallback != null) {
			rawCard = await this.signCallback(rawCard);
		}

		const publishedModel = await this.tryDo(context, accessToken,
			async token => await this.client.publishCard(rawCard, token.toString()));


		/*if (!deepEqual(rawCard.content_snapshot, publishedModel.content_snapshot)) {
			throw new CardVerificationException("Publishing returns invalid card");
		}*/

		const card = parseRawSignedModel(this.crypto, publishedModel);
		this.validateCards([ card ]);
		return card;
	}

	async getCard(cardId: string): Promise<ICard> {
		const tokenContext: ITokenContext = { operation: 'get' };

		const accessToken = await this.accessTokenProvider.getToken(tokenContext);
		const cardWithStatus = await this.tryDo(tokenContext, accessToken,
			async (token) => await this.client.getCard(cardId, token.toString()));

		const card = parseRawSignedModel( this.crypto, cardWithStatus.cardRaw, cardWithStatus.isOutdated );

		if (card.id != cardId) throw new Error("Invalid card");

		this.validateCards([ card ]);
		return card;
	}

	async searchCards (identity: string): ICard[] {
		const tokenContext: ITokenContext = { operation: 'search' };

		const accessToken = await this.accessTokenProvider.getToken(tokenContext);
		const rawCards = await this.tryDo(tokenContext, accessToken,
			async (token) => await this.client.searchCards(identity, token.toString()));

		const cards = rawCards.map(raw => parseRawSignedModel(this.crypto, raw, false));

		if (cards.some(c => c.identity != identity)) throw new Error("Invalid cards");

		this.validateCards(cards);
		return cards;
	}

	importCard (rawCard: IRawSignedModel): ICard {
		const card = parseRawSignedModel( this.crypto, rawCard );
		this.validateCards([ card ]);
		return card;
	}

	importCardFromString (str: string): ICard {
		return this.importCard( generateRawSignedFromString(str) );
	}

	importCardFromJson (json: string): ICard {
		return this.importCard( generateRawSignedFromJson(json) );
	}

	exportCard (card: ICard): IRawSignedModel {
		return cardToRawSignedModel(this.crypto, card);
	}

	private async tryDo<T> (context: ITokenContext, token: IAccessToken, func: (token: IAccessToken) => Promise<T>): Promise<T> {
		try {
			return await func(token);
		} catch (e) {
			// todo: e instanceof UnauthorizedClientException

			if (!this.retryOnUnauthorized) throw e;

			token = await this.accessTokenProvider.getToken({
				identity: context.identity,
				operation: context.operation,
				forceReload: true
			});

			return await func(token);
		}
	}

	private validateCards(cards: ICard[]) {
		if (this.verifier == null) return;

		for (const card of cards) {
			if (!this.verifier.verifyCard(card)) {
				throw new CardVerificationError("Validation errors have been detected");
			}
		}
	}
}