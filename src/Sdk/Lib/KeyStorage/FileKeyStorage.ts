import { IKeyStorage, IKeyStorageConfig } from './IKeyStorage';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mkdirp_ from 'mkdirp';
import * as rimraf_ from 'rimraf';
import { PrivateKeyExistsError } from './PrivateKeyExistsError';

const mkdirp = mkdirp_;
const rimraf = rimraf_;

const defaults: IKeyStorageConfig = {
	dir: '.virgil_keys'
};

export class FileKeyStorage implements IKeyStorage {

	private config: IKeyStorageConfig;

	constructor (config?: IKeyStorageConfig|string) {
		this.config = typeof config === 'string'
			? { ...defaults, dir: config }
			: { ...defaults, ...(config || {}) };

		mkdirp.sync(path.resolve(this.config.dir!));
	}

	public exists(name: string): Promise<boolean> {
		assert(name != null, '`name` is required');
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.access(file, err => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve(false);
					}
					return reject(err);
				}

				resolve(true);
			});
		});
	}

	public load(name: string): Promise<Buffer|null> {
		assert(name != null, '`name` is required');
		return new Promise<Buffer|null>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.readFile(file, (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve(null as any);
					}

					return reject(err);
				}

				resolve(data);
			});
		});
	}

	public remove(name: string): Promise<boolean> {
		assert(name != null, '`name` is required');
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(name);
			fs.unlink(file, err => {
				if (err) {
					if (err.code === 'ENOENT') {
						return resolve(false);
					}

					return reject(err);
				}

				resolve(true);
			});
		});
	}

	public save(name: string, privateKeyData: Buffer): Promise<void> {
		assert(name != null, '`name` is required');
		assert(Buffer.isBuffer(privateKeyData), '`privateKeyData` must be a Buffer');
		return new Promise<void>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.writeFile(file, privateKeyData, { flag: 'wx' }, err => {
				if (err) {
					if (err.code === 'EEXIST') {
						return reject(new PrivateKeyExistsError());
					}

					return reject(err);
				}

				resolve();
			});
		});
	}

	public clear (): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			rimraf(this.config.dir!, err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	}

	private resolveFilePath (key: string): string {
		return path.resolve(this.config.dir!, this.hash(key));
	}

	private hash (data: string): string {
		return crypto
			.createHash('sha256')
			.update(data)
			.digest('hex');
	}
}
