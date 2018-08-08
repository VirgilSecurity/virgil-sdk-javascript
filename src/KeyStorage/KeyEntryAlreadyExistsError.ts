import { VirgilError } from '../VirgilError';

/**
 * Error thrown from {@link KeyEntryStorage.save} method when saving a
 * a key entry with the name that already exists in store.
 */
export class KeyEntryAlreadyExistsError extends VirgilError {
	constructor(name?: string) {
		super(
			`Key entry ${ name ? 'named ' + name : 'with same name' }already exists`,
			'KeyEntryAlreadyExistsError'
		);
	}
}
