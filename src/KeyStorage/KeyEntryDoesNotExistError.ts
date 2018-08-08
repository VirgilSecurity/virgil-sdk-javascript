import { VirgilError } from '../VirgilError';

/**
 * Error thrown from {@link KeyEntryStorage.update} method when updating
 * a key entry that doesn't exist in store.
 */
export class KeyEntryDoesNotExistError extends VirgilError {
	constructor(name: string) {
		super(
			`Key entry ${ name ? 'named ' + name : 'with the given name'} does not exist.`,
			'KeyEntryDoesNotExistError'
		);
	}
}
