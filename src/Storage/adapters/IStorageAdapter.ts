/**
 * Configuration options of {@link FileSystemStorageAdapter} and
 * {@link IndexedDbStorageAdapter}.
 */
export interface IStorageAdapterConfig {
	dir: string;
	name: string;
}

/**
 * Interface to be implemented by objects capable of storing binary data
 * in persistent storage.
 */
export interface IStorageAdapter {
	/**
	 * Saves the `data` under the `key` in persistent storage. If the key
	 * already exists, throws {@link StorageEntryAlreadyExistsError}.
	 * @param {string} key - The key.
	 * @param {Buffer} data - The data.
	 * @returns {Promise<void>}
	 */
	store (key: string, data: Buffer): Promise<void>;

	/**
	 * Retieves the data for the `key`.
	 * @param {string} key - The key.
	 * @returns {Promise<Buffer|null>} - Promise resolved with the
	 * data for the given key, or null if there's no data.
	 */
	load (key: string): Promise<Buffer|null>;

	/**
	 * Checks if the data for the `key` exists.
	 * @param {string} key - The key to check.
	 * @returns {Promise<boolean>} - Promise resolved with `true`
	 * if data for the `key` exists, or `false` otherwise.
	 */
	exists (key: string): Promise<boolean>;

	/**
	 * Removes the data for the `key`.
	 * @param {string} key - The key to remove.
	 * @returns {Promise<boolean>} Promise resolved with `true`
	 * if data have been removed, or `false` otherwise.
	 */
	remove (key: string): Promise<boolean>;

	/**
	 * Sets the new data for the `key`.
	 * @param {string} key - The key to update.
	 * @param {Buffer} data - The new data.
	 */
	update (key: string, data: Buffer): Promise<void>;

	/**
	 * Removes all of the entries from persistent storage.
	 * @returns {Promise<void>}
	 */
	clear (): Promise<void>;

	/**
	 * Retrieves a collection of all of the values in persistent storage.
	 * @returns {Promise<Buffer[]>}
	 */
	list (): Promise<Buffer[]>;
}
