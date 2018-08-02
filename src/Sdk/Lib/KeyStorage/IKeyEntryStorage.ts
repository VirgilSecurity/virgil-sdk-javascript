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
	name: string;
	value: Buffer;
	meta?: KeyEntryMeta;
}

export interface IUpdateKeyEntryParams {
	name: string;
	value?: Buffer;
	meta?: KeyEntryMeta;
}

export interface IKeyEntryStorage {
	save (params: ISaveKeyEntryParams): Promise<IKeyEntry>;
	load (name: string): Promise<IKeyEntry|null>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<boolean>;
	list (): Promise<IKeyEntry[]>;
	update (params: IUpdateKeyEntryParams): Promise<IKeyEntry>;
}
