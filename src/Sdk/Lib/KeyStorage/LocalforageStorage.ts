import { IKeyStorage } from './IKeyStorage';

// todo: correct imports
var localforage = require('localforage');
var toArrayBuffer = require('to-arraybuffer');
var utils = require('../../shared/utils');

var defaults = {
	driver: localforage.INDEXEDDB
};

export class LocalforageStorage implements IKeyStorage {
	private store: any;

	constructor (config = {}) {
		this.store = localforage.createInstance({ ...defaults, ...config });
	}

	public async exists(name: string): Promise<boolean> {
		const value = await this.store.getItem(name);

		return value != null;
	}

	public async load(name: string): Promise<Buffer> {
		const value = await this.store.getItem(name);

		return new Buffer(new Uint8Array(value));
	}

	public async remove(name: string): Promise<void> {
		return this.store.removeItem(name);
	}

	public async save(name: string, privateKeyData: Buffer): Promise<void> {
		return this.store.setItem(name, toArrayBuffer(privateKeyData));
	}

}
