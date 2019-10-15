import { VirgilError } from '../VirgilError';

/**
 * Error thrown by {@link CardManager} instances when the card received from
 * the network (or imported from string\json) fails verification.
 */
export class VirgilCardVerificationError extends VirgilError {
	constructor(m: string) {
		super(m, 'CardVerificationError', VirgilCardVerificationError);
	}
}
