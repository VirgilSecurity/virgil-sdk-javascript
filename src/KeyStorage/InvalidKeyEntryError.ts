import { VirgilError } from '../VirgilError';

/**
 * Error thrown when the value loaded from persistent storage cannot be
 * parsed as a {@link IKeyEntry} object.
 */
export class InvalidKeyEntryError extends VirgilError {
	constructor(message: string = 'Loaded key entry was in invalid format.') {
		super(message, 'InvalidKeyEntryError');
	}
}
