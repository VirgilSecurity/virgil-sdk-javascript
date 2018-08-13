import { IStorageAdapter } from '../adapters/IStorageAdapter';

/**
 * User-defined metadata stored with {@link IKeyEntry}.
 */
export type KeyEntryMeta = { [key: string]: string };

/**
 * Object representing {@link KeyEntryStorage} configuration options.
 * This combines the {@link IStorageAdapterConfig} with the ability to
 * specify the adapter itself. All three properties are mutually exclusive.
 */
export interface IKeyEntryStorageConfig {
	/**
	 * Node.js only. File system path to the folder where the entries will be
	 * persisted. If it's a relative path, it is resolved using
	 * {@link `path.resolve`|https://nodejs.org/dist/latest/docs/api/path.html#path_path_resolve_paths}.
	 */
	dir?: string;

	/**
	 * Browser only. Name of the IndexedDB database where the entries will be
	 * persisted.
	 */
	name?: string;

	/**
	 * Object implementing the `IStorageAdapter` interface.
	 */
	adapter?: IStorageAdapter;
}

/**
 * Interface of a single entry in {@link IKeyEntryStorage}.
 */
export interface IKeyEntry {
	name: string;
	value: Buffer;
	meta?: KeyEntryMeta;
	creationDate: Date;
	modificationDate: Date;
}

/**
 * Parameters of {@link KeyEntryStorage.save} method.
 */
export interface ISaveKeyEntryParams {
	name: string;
	value: Buffer;
	meta?: KeyEntryMeta;
}

/**
 * Parameters of {@link KeyEntryStorage.update} method.
 * Although both `value` and `meta` are marked as optional, at least one of
 * them must be provided, or else a `TypeError` will be thrown.
 */
export interface IUpdateKeyEntryParams {
	/**
	 * Name of the key entry to update.
	 * > Note! The name itself cannot be changed.
	 */
	name: string;

	/**
	 * New value of the key entry. Optional. If ommited, the original
	 * value remains intact.
	 */
	value?: Buffer;

	/**
	 * New metadata of the key entry. Optional. If provided, overwrites
	 * the previous metadata completely. If ommited, the original metadata
	 * remains intact.
	 */
	meta?: KeyEntryMeta;
}

/**
 * Interface to be implemented by object capable of persisting
 * private keys data and metadata.
 */
export interface IKeyEntryStorage {
	/**
	 * Saves key entry represented by `params`.
	 * @param {ISaveKeyEntryParams} params - New key entry parameters.
	 * @returns {Promise<IKeyEntry>} Promise resolved with stored entry,
	 * or rejected with {@link PrivateKeyExistsError} error in case entry
	 * with the same name already exists.
	 */
	save (params: ISaveKeyEntryParams): Promise<IKeyEntry>;

	/**
	 * Retrieves key entry by name.
	 * @param {string} name - Name of the key entry to retrieve.
	 * @returns {Promise<IKeyEntry|null>} Promise resolved with stored entry
	 * or `null` if entry with the given name does not exist.
	 */
	load (name: string): Promise<IKeyEntry|null>;

	/**
	 * Checks if key entry exists by name.
	 * @param {string} name - Name of the entry to check.
	 * @returns {Promise<boolean>} - Promise resolved with `true`
	 * if key entry exists, or `false` otherwise.
	 */
	exists (name: string): Promise<boolean>;

	/**
	 * Removes key entry by name.
	 * @param {string} name - Name of the key entry to remove.
	 * @returns {Promise<boolean>} - Promise resolved with `true`
	 * if key entry was removed, or `false` otherwise.
	 */
	remove (name: string): Promise<boolean>;

	/**
	 * Retrieves a collection of all stored entries.
	 * @returns {Promise<IKeyEntry>} - Promise resolved with array
	 * of all stored entries.
	 */
	list (): Promise<IKeyEntry[]>;

	/**
	 * Updates the value or metadata (or both) of the key entry identified
	 * by `params.name`.
	 * @param {IUpdateKeyEntryParams} params - Paremeters identifying the
	 * entry to update and new value or metadata (or both).
	 */
	update (params: IUpdateKeyEntryParams): Promise<IKeyEntry>;

	/**
	 * Removes all of the stored entries.
	 * @returns {Promise<void>}
	 */
	clear (): Promise<void>;
}
