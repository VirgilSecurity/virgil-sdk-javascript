import { VirgilError } from '../VirgilError';

export class KeyEntryDoesNotExistError extends VirgilError {
	constructor(name: string) {
		super(
			`Key entry ${ name ? 'named ' + name : 'with the given name'} does not exist.`,
			'KeyEntryDoesNotExistError'
		);
	}
}
