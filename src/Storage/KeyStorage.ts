import StorageAdapter from './adapters/FileSystemStorageAdapter';
import { IStorageAdapter, IStorageAdapterConfig } from './adapters/IStorageAdapter';
import { PrivateKeyExistsError } from './errors';

export interface IKeyStorageConfig {
	/**
	 * Path to folder where to store the data (Node.js only).
	 */
	dir?: string;

	/**
	 * Name of the IndexedDB database where to store the data (Browsers only).
	 */
	name?: string;

	/**
	 * The {@link IStorageAdapter} implementation to be used as a storage backend.
	 */
	adapter?: IStorageAdapter;
}

const DEFAULTS: IStorageAdapterConfig = {
	dir: '.virgil_keys',
	name: 'VirgilKeys'
};

/**
 * Class representing a storage container for private key data.
 * Use this class if you need to load the keys stored with
 * version 4.x of this library. For new code, use the
 * {@link PrivateKeyStorage} instead.
 *
 * @deprecated since version 5.0
 */
export class KeyStorage {
	private adapter: IStorageAdapter;

	constructor (config: IKeyStorageConfig | string = {}) {
		console.log('Warning! `KeyStorage` is deprecated. Use `PrivateKeyStorage` instead.');

		this.adapter = resolveAdapter(config);
	}

	/**
	 * Checks whether a private key data with the given name exist in persistent storage.
	 * @param {string} name - Name to check.
	 * @returns {Promise<boolean>} - True if key data exist, otherwise false.
	 */
	exists(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.exists(name);
	}

	/**
	 * Loads the private key data by the given name.
	 * @param {string} name - Name of key data to load.
	 * @returns {Promise<Buffer | null>} - Private key data as Buffer,
	 * or null if there is no data for the given name.
	 */
	load(name: string): Promise<Buffer | null> {
		validateName(name);
		return this.adapter.load(name);
	}

	/**
	 * Removes the private key data stored under the given name from persistent storage.
	 * @param {string} name - Name of the key data to remove.
	 * @returns {Promise<boolean>} - True if the key has been removed, otherwise false.
	 */
	remove(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.remove(name);
	}

	/**
	 * Persists the private key data under the given name.
	 * @param {string} name - Name of the key data.
	 * @param {Buffer} data - The key data.
	 * @returns {Promise<void>}
	 */
	save(name: string, data: Buffer): Promise<void> {
		validateName(name);
		validateData(data);
		return this.adapter.store(name, data)
			.catch(error => {
				if (error && error.code === 'EEXIST') {
					return Promise.reject(new PrivateKeyExistsError());
				}

				return Promise.reject(error);
			});
	}
}

function resolveAdapter (config: IKeyStorageConfig|string) {
	if (typeof config === 'string') {
		return new StorageAdapter({ dir: config, name: config });
	}

	const { adapter, ...rest } = config;
	if (adapter != null) {
		return adapter;
	}

	return new StorageAdapter({ ...DEFAULTS, ...rest });
}

function validateName (name: string) {
	if (!name) throw new TypeError('Argument `name` is required.');
}

function validateData (data: Buffer) {
	if (!data) throw new TypeError('Argument `data` is required.');
}

