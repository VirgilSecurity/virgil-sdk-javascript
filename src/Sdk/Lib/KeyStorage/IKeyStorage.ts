export interface IKeyStorageConfig {
	dir?: string;
	name?: string;
}

export interface IKeyStorage {
	save (name: string, privateKeyData: Buffer): Promise<void>;
	load (name: string): Promise<Buffer|null>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<boolean>;
	clear (): Promise<void>;
}
