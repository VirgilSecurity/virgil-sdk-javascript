import { VirgilError } from '../VirgilError';

export class InvalidKeyEntryError extends VirgilError {
	constructor(message: string = 'Loaded key entry was in invalid format.') {
		super(message, 'InvalidKeyEntryError');
	}
}
