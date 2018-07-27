import { VirgilError } from '../VirgilError';

export class KeyEntryAlreadyExistsError extends VirgilError {
	constructor(name?: string) {
		super(
			`Key entry ${ name ? 'named ' + name : 'with same name' }already exists`,
			'KeyEntryAlreadyExistsError'
		);
	}
}
