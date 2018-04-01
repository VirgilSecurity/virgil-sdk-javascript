import { ICard } from './ICard';

export interface ICardVerifier {
	verifyCard(card: ICard): boolean;
}

export class CardVerificationError extends Error {
	constructor(m: string) {
		super(m);
		Object.setPrototypeOf(this, CardVerificationError.prototype);
	}
}