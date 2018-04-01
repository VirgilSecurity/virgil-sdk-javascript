import { ICardCrypto } from '../CryptoApi/ICardCrypto';
import { IRawSignedModel } from './Web/IRawSignedModel';
import { CardClient } from './Web/CardClient';
import { ModelSigner } from './Web/ModelSigner';
import { ICard } from './ICard';
import { CardVerificationError, ICardVerifier } from './CardVerifier';

export type ISignCallback =  (model: IRawSignedModel) => Promise<IRawSignedModel>;

export interface ICardManagerParams {
	readonly cardCrypto: ICardCrypto;
	readonly signCallback: ISignCallback;
	readonly apiUrl?: string;
	readonly retryOnUnauthorized: boolean;
	 readonly verifier: ICardVerifier;

	// readonly accessTokenProvider: IAccessTokenProvider;
}

export class CardManager {
	public readonly client: CardClient;
	public readonly modelSigner: ModelSigner;
	public readonly signCallback: ISignCallback;
	public readonly retryOnUnauthorized: boolean;
	public readonly verifier: ICardVerifier;

	// public readonly accessTokenProvider: IAccessTokenProvider;

	public constructor (params: ICardManagerParams) {
		this.client = new CardClient(params.apiUrl);
		this.modelSigner = new ModelSigner(params.cardCrypto);
		this.signCallback = params.signCallback;
		this.retryOnUnauthorized = params.retryOnUnauthorized;
		this.verifier = params.verifier;
	}

	generateRawCard() {

	}

	publishRawCard (rawCard: IRawSignedModel) {

	}

	getCard(cardId: string): ICard {
		return {} as ICard;
	}

	searchCards (identity: String): ICard[] {
		return [];
	}

	importCard (rawCard: IRawSignedModel): ICard {
		const card = {} as ICard; // = CardUtils.Parse(CardCrypto, model);
		this.validateCards([ card ]);
		return card;
	}

	exportCard (card: ICard): IRawSignedModel {
		// return RawSignedModelUtils.Parse(CardCrypto, card);
		return {} as IRawSignedModel;
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