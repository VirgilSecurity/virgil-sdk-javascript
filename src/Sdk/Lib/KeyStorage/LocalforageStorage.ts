import { IKeyStorage, IKeyStorageConfig } from './IKeyStorage';
import localforage from 'localforage';
import { PrivateKeyExistsError } from './PrivateKeyExistsError';

const defaults = {
	driver: localforage.INDEXEDDB
};

export class LocalforageStorage implements IKeyStorage {
	private store: LocalForage;

	constructor (config: IKeyStorageConfig = { name: 'VirgilKeys' }) {
		this.store = localforage.createInstance({ ...defaults, name: config.name });
	}

	public async exists(name: string): Promise<boolean> {
		assert(name != null, '`name` is required');
		const value = await this.store.getItem(name);
		return value != null;
	}

	public async load(name: string): Promise<Buffer> {
		assert(name != null, '`name` is required');
		const value = await this.store.getItem<ArrayBuffer>(name);
		return new Buffer(new Uint8Array(value));
	}

	public async remove(name: string): Promise<boolean> {
		assert(name != null, '`name` is required');
		const value = await this.load(name);
		if (value == null) {
			return false;
		}

		await this.store.removeItem(name);

		return true;
	}

	public async save(name: string, privateKeyData: Buffer): Promise<void> {
		assert(name != null, '`name` is required');
		assert(Buffer.isBuffer(privateKeyData), '`privateKeyData` must be a Buffer');
		const value = await this.load(name);
		if (value != null) {
			throw new PrivateKeyExistsError();
		}
		await this.store.setItem(name, toArrayBuffer(privateKeyData));
	}

	public async clear() {
		return localforage.clear();
	}

}

// taken from here https://github.com/jhiesey/to-arraybuffer
function toArrayBuffer (buf: Buffer): ArrayBuffer {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer as ArrayBuffer;
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		const arrayCopy = new Uint8Array(buf.length);
		const len = buf.length;
		for (let i = 0; i < len; i++) {
			arrayCopy[i] = buf[i];
		}
		return arrayCopy.buffer as ArrayBuffer;
	} else {
		throw new Error('Argument must be a Buffer');
	}
}
