import { IPrivateKey, IPrivateKeyExporter } from '../types';
import { IKeyEntryStorage } from './KeyEntryStorage/IKeyEntryStorage';
import { KeyEntryStorage } from './KeyEntryStorage/KeyEntryStorage';
import { PrivateKeyExistsError } from './errors';

/**
 * Interface of a single entry in {@link PrivateKeyStorage}.
 */
export interface IPrivateKeyEntry {
	privateKey: IPrivateKey,
	meta?: { [key: string]: string }
}

/**
 * Class responsible for storage of private keys.
 */
export class PrivateKeyStorage {

	/**
	 * Initializes a new instance of `PrivateKeyStorage`.
	 * @param {IPrivateKeyExporter} privateKeyExporter - Object responsible for
	 * exporting private key bytes from `IPrivateKey` objects and importing
	 * private key bytes into `IPrivateKey` objects.
	 * @param {IKeyEntryStorage} keyEntryStorage - Object responsible for
	 * persistence of private keys data.
	 */
	constructor (
		private privateKeyExporter: IPrivateKeyExporter,
		private keyEntryStorage: IKeyEntryStorage = new KeyEntryStorage()
	) {}

	/**
	 * Persists the given `privateKey` and `meta` under the given `name`.
	 * If an entry with the same name already exists rejects the returned
	 * Promise with {@link PrivateKeyExistsError} error.
	 *
	 * @param {string} name - Name of the private key.
	 * @param {IPrivateKey} privateKey - The private key object.
	 * @param {Object<string, string>} [meta] - Optional metadata to store with the key.
	 *
	 * @returns {Promise<void>}
	 */
	async store (name: string, privateKey: IPrivateKey, meta?: { [key: string]: string }) {
		const privateKeyData = this.privateKeyExporter.exportPrivateKey(privateKey);
		try {
			await this.keyEntryStorage.save({ name, value: privateKeyData.toString('base64'), meta });
		} catch (error) {
			if (error && error.name === 'KeyEntryAlreadyExistsError') {
				throw new PrivateKeyExistsError(`Private key with the name ${name} already exists.`);
			}

			throw error;
		}
	}

	/**
	 * Retrieves the private key with the given `name` from persistent storage.
	 * If private with the given name does not exist, resolves the returned
	 * Promise with `null`.
	 *
	 * @param {string} name - Name of the private key to load.
	 * @returns {Promise<IPrivateKeyEntry|null>}
	 */
	async load (name: string): Promise<IPrivateKeyEntry|null> {
		const keyEntry = await this.keyEntryStorage.load(name);
		if (keyEntry === null) {
			return null;
		}
		const privateKey = this.privateKeyExporter.importPrivateKey(keyEntry.value);
		return {
			privateKey,
			meta: keyEntry.meta
		};
	}

	/**
	 * Removes the private key entry with the given `name` from persistent
	 * storage.
	 *
	 * @param {string} name - Name of the private key to remove.
	 * @returns {Promise<void>}
	 */
	async delete (name: string): Promise<void> {
		await this.keyEntryStorage.remove(name);
	}
}
