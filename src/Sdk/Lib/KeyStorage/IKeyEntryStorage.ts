import { IStorageAdapter } from './adapters/IStorageAdapter';

export type KeyEntryMeta = { [key: string]: string };

export interface IKeyEntryStorageConfig {
	dir?: string;
	name?: string;
	adapter?: IStorageAdapter;
}

export interface IKeyEntry {
	name: string;
	value: Buffer;
	meta?: KeyEntryMeta;
	creationDate: Date;
	modificationDate: Date;
}

export interface ISaveKeyEntryParams {
	value: Buffer;
	meta?: KeyEntryMeta;
}

export interface IUpdateKeyEntryParams {
	value?: Buffer;
	meta?: KeyEntryMeta;
}

export interface IKeyEntryStorage {
	save (name: string, params: ISaveKeyEntryParams): Promise<IKeyEntry>;
	load (name: string): Promise<IKeyEntry|null>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<boolean>;
	list (): Promise<IKeyEntry[]>;
	update (name: string, params: IUpdateKeyEntryParams): Promise<IKeyEntry>;
}
