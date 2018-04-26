import { VirgilError } from '../VirgilError';

export class PrivateKeyExistsError extends VirgilError {
	constructor(message: string = 'Private key with same name already exists') {
		super(message, 'PrivateKeyExistsError');
	}
}
