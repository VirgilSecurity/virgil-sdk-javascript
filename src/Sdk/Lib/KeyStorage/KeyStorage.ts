import StorageAdapter from './adapters/FileSystemStorageAdapter';
import { IStorageAdapter, IStorageAdapterConfig } from './adapters/IStorageAdapter';
import { PrivateKeyExistsError } from './PrivateKeyExistsError';

export interface IKeyStorageConfig {
	dir?: string;
	name?: string;
	adapter?: IStorageAdapter;
}

const DEFAULTS: IStorageAdapterConfig = {
	dir: '.virgil_keys',
	name: 'VirgilKeys'
};

export class KeyStorage {
	private adapter: IStorageAdapter;

	constructor (config: IKeyStorageConfig | string = {}) {
		this.adapter = resolveAdapter(config);
	}

	exists(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.exists(name);
	}

	load(name: string): Promise<Buffer | null> {
		validateName(name);
		return this.adapter.load(name);
	}

	remove(name: string): Promise<boolean> {
		validateName(name);
		return this.adapter.remove(name);
	}

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

