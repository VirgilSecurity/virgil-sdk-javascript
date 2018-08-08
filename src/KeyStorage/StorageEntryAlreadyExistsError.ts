import { VirgilError } from '../VirgilError';

/**
 * Error thrown by {@link IStorageAdapter.store} method when saving a value
 * with a key that already exists in store.
 */
export class StorageEntryAlreadyExistsError extends VirgilError {
	constructor(key?: string) {
		super(
			`Storage entry ${ key ? 'with key ' + name : 'with the given key' }already exists`,
			'StorageEntryAlreadyExistsError'
		);
	}
}
