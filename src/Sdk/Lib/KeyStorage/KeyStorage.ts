import { IKeyEntry, IKeyStorage, IKeyStorageConfig } from './IKeyStorage';
import StorageAdapter from './adapters/FileSystemStorageAdapter';
import { IStorageAdapter, IStorageAdapterConfig } from './adapters/IStorageAdapter';
import { PrivateKeyExistsError } from './PrivateKeyExistsError';

const DEFAULTS: IStorageAdapterConfig = {
	dir: '.virgil_keys',
	name: 'VirgilKeys'
};

const VALUE_KEY = 'value';

export class KeyStorage implements IKeyStorage {
	private adapter: IStorageAdapter;

	constructor (config: IKeyStorageConfig | string = {}) {
		this.adapter = resolveAdapter(config);
	}

	exists(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.exists(name);
	}

	load(name: string): Promise<IKeyEntry | null> {
		validateName(name);
		return this.adapter.load(name)
			.then(data => {
				if (data == null) {
					return null;
				}

				return deserializeKeyEntry(data, name);
			})
	}

	remove(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.remove(name);
	}

	save(keyEntry: IKeyEntry): Promise<void> {
		validateKeyEntry(keyEntry);
		const data = serializeKeyEntry(keyEntry);
		return this.adapter.store(keyEntry.name, data)
			.catch(error => {
				if (error && error.code === 'EEXIST') {
					return Promise.reject(new PrivateKeyExistsError());
				}

				return Promise.reject(error);
			});
	}

	list (): Promise<IKeyEntry[]> {
		return this.adapter.list().then(entries =>
			entries.map(entry => deserializeKeyEntry(entry.value, entry.key))
		);
	}
}

function serializeKeyEntry (keyEntry: IKeyEntry): Buffer {
	const { value, ...rest } = keyEntry;
	const serializableEntry = {
		...rest,
		value: value.toString('base64')
	};

	return Buffer.from(JSON.stringify(serializableEntry), 'utf8');
}

function deserializeKeyEntry (data: Buffer, name: string): IKeyEntry {
	const maybeJson = data.toString('utf8');
	try {
		return JSON.parse(
			maybeJson,
			(key, value) => key === VALUE_KEY ? Buffer.from(value, 'base64') : value
		);
	} catch (e) {
		return {
			name,
			value: data
		};
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

function validateKeyEntry (keyEntry: IKeyEntry) {
	if (!keyEntry) throw new TypeError('Argument `keyEntry` is required.');
	if (!keyEntry.name) throw new TypeError('Invalid `keyEntry`. Property `name` is required');
	if (!keyEntry.value) throw new TypeError('Invalid `keyEntry`. Property `value` is required');
}
