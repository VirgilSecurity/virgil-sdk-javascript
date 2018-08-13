import { VirgilError } from '../../VirgilError';

/**
 * Error thrown when the value loaded from persistent storage cannot be
 * parsed as a {@link IKeyEntry} object.
 */
export class InvalidKeyEntryError extends VirgilError {
	constructor(message: string = 'Loaded key entry was in invalid format.') {
		super(message, 'InvalidKeyEntryError');
	}
}

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
