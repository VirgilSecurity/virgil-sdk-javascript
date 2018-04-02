var toArrayBuffer = require('to-arraybuffer')

export interface IKeyStorage {
	save (name: string, privateKeyData: Buffer): Promise<void>;
	load (name: string): Promise<Buffer>;
	exists (name: string): Promise<boolean>;
	remove (name: string): Promise<void>;
}

