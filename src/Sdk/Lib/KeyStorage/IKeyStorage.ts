import { IStorageAdapter } from './adapters/IStorageAdapter';

export interface IKeyStorageConfig {
	dir?: string;
	name?: string;
	adapter?: IStorageAdapter;
}

export interface IKeyEntry {
	name: string;
	value: Buffer;
	meta?: { [key: string]: string };
}

export interface IKeyStorage {
	save (keyEntry: IKeyEntry): Promise<void>;
	load (name: string): Promise<IKeyEntry|null>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<boolean>;
}
