import { VirgilError } from '../VirgilError';

/**
 * Error thrown from {@link PrivateKeyStorage.save} method when saving
 * a private key with a name that already exists in store.
 */
export class PrivateKeyExistsError extends VirgilError {
	constructor(message: string = 'Private key with same name already exists') {
		super(message, 'PrivateKeyExistsError', PrivateKeyExistsError);
	}
}
