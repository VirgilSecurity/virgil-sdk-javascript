import { VirgilError } from '../VirgilError';

export class StorageEntryAlreadyExistsError extends VirgilError {
	constructor(key?: string) {
		super(
			`Storage entry ${ key ? 'with key ' + name : 'with the given key' }already exists`,
			'StorageEntryAlreadyExistsError'
		);
	}
}
