import { IStorageAdapter } from './adapters/IStorageAdapter';

export interface IKeyEntryStorageConfig {
	dir?: string;
	name?: string;
	adapter?: IStorageAdapter;
}

export interface IKeyEntry {
	name: string;
	value: Buffer;
	meta?: { [key: string]: string };
}

export interface IKeyEntryStorage {
	save (keyEntry: IKeyEntry): Promise<void>;
	load (name: string): Promise<IKeyEntry|null>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<boolean>;
	list (): Promise<IKeyEntry[]>;
}
