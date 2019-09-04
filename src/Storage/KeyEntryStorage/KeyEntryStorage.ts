import {
	IKeyEntry,
	IKeyEntryStorage,
	IKeyEntryStorageConfig,
	ISaveKeyEntryParams,
	IUpdateKeyEntryParams,
} from './IKeyEntryStorage';
import { DefaultStorageAdapter } from '../adapters/DefaultStorageAdapter';
import { IStorageAdapter, IStorageAdapterConfig } from '../adapters/IStorageAdapter';
import { InvalidKeyEntryError, KeyEntryAlreadyExistsError, KeyEntryDoesNotExistError } from './errors';

const DEFAULTS: IStorageAdapterConfig = {
	dir: '.virgil_key_entries',
	name: 'VirgilKeyEntries'
};

const VALUE_KEY = 'value';
const CREATION_DATE_KEY = 'creationDate';
const MODIFICATION_DATE_KEY = 'modificationDate';

export { IKeyEntry, IKeyEntryStorage, IKeyEntryStorageConfig, ISaveKeyEntryParams, IUpdateKeyEntryParams };

/**
 * Class responsible for persisting private key bytes with optional
 * user-defined metadata.
 */
export class KeyEntryStorage implements IKeyEntryStorage {
	private adapter: IStorageAdapter;

	/**
	 * Initializes a new instance of `KeyEntryStorage`.
	 *
	 * @param {IKeyEntryStorageConfig} config - Instance configuration.
	 */
	constructor (config: IKeyEntryStorageConfig | string = {}) {
		this.adapter = resolveAdapter(config);
	}

	/**
	 * @inheritDoc
	 */
	exists(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.exists(name);
	}

	/**
	 * @inheritDoc
	 */
	load(name: string): Promise<IKeyEntry | null> {
		validateName(name);
		return this.adapter.load(name).then(data => {
			if (data == null) {
				return null;
			}
			return deserializeKeyEntry(data);
		});
	}

	/**
	 * @inheritDoc
	 */
	remove(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.remove(name);
	}

	/**
	 * @inheritDoc
	 */
	save({ name, value, meta }: ISaveKeyEntryParams): Promise<IKeyEntry> {
		validateNameProperty(name);
		validateValueProperty(value);

		const keyEntry = {
			name: name,
			value: value,
			meta: meta,
			creationDate: new Date(),
			modificationDate: new Date()
		};

		return this.adapter.store(name, serializeKeyEntry(keyEntry))
			.then(() => keyEntry)
			.catch(error => {
				if (error && error.name === 'StorageEntryAlreadyExistsError') {
					throw new KeyEntryAlreadyExistsError(name);
				}

				throw error;
			});
	}

	/**
	 * @inheritDoc
	 */
	list (): Promise<IKeyEntry[]> {
		return this.adapter.list()
			.then(entries => entries.map(entry => deserializeKeyEntry(entry)));
	}

	/**
	 * @inheritDoc
	 */
	update ({ name, value, meta }: IUpdateKeyEntryParams): Promise<IKeyEntry> {
		validateNameProperty(name);
		if (!(value || meta)) {
			throw new TypeError(
				'Invalid argument. Either `value` or `meta` property is required.'
			);
		}

		return this.adapter.load(name)
			.then(data => {
				if (data === null) {
					throw new KeyEntryDoesNotExistError(name)
				}

				const entry = deserializeKeyEntry(data);
				const updatedEntry = Object.assign(entry,{
					value: value || entry.value,
					meta: meta || entry.meta,
					modificationDate: new Date()
				});
				return this.adapter.update(name, serializeKeyEntry(updatedEntry))
					.then(() => updatedEntry);
			});
	}

	/**
	 * @inheritDoc
	 */
	clear () {
		return this.adapter.clear();
	}
}

function serializeKeyEntry (keyEntry: IKeyEntry) {
	return JSON.stringify(keyEntry);
}

function deserializeKeyEntry (data: string): IKeyEntry {
	try {
		return JSON.parse(
			data,
			(key, value) => {
				if (key === CREATION_DATE_KEY || key === MODIFICATION_DATE_KEY) {
					return new Date(value);
				}
				return value;
			}
		);
	} catch (error) {
		throw new InvalidKeyEntryError();
	}
}

function resolveAdapter (config: IKeyEntryStorageConfig|string) {
	if (typeof config === 'string') {
		return new DefaultStorageAdapter({ dir: config, name: config });
	}

	const { adapter, ...rest } = config;
	if (adapter != null) {
		return adapter;
	}

	return new DefaultStorageAdapter({ ...DEFAULTS, ...rest });
}

const requiredArg = (name: string) => (value: any) => {
	if (!value) throw new TypeError(`Argument '${name}' is required.`);
};
const requiredProp = (name: string) => (value: any) => {
	if (!value) throw new TypeError(`Invalid argument. Property ${name} is required`)
};

const validateName = requiredArg('name');
const validateNameProperty = requiredProp('name');
const validateValueProperty = requiredProp('value');
