import { IStorageAdapter, IStorageAdapterConfig } from './IStorageAdapter';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mkdirp_ from 'mkdirp';
import * as rimraf_ from 'rimraf';

const mkdirp = mkdirp_;
const rimraf = rimraf_;

const NO_SUCH_FILE_ERROR = 'ENOENT';

export default class FileSystemStorageAdapter implements IStorageAdapter {

	private config: IStorageAdapterConfig;

	constructor (config: IStorageAdapterConfig) {
		this.config = config;

		mkdirp.sync(path.resolve(this.config.dir));
	}

	store(key: string, data: Buffer): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const file = this.resolveFilePath(key);

			fs.writeFile(file, data, { flag: 'wx' }, err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	}

	load(key: string): Promise<Buffer|null> {
		return new Promise<Buffer|null>((resolve, reject) => {
			const file = this.resolveFilePath(key);

			fs.readFile(file, (err, data) => {
				if (err) {
					if (err.code === NO_SUCH_FILE_ERROR) {
						return resolve(null as any);
					}

					return reject(err);
				}

				resolve(data);
			});
		});
	}

	exists(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(key);

			fs.access(file, err => {
				if (err) {
					if (err.code === NO_SUCH_FILE_ERROR) {
						return resolve(false);
					}
					return reject(err);
				}

				resolve(true);
			});
		});
	}

	remove(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(key);
			fs.unlink(file, err => {
				if (err) {
					if (err.code === NO_SUCH_FILE_ERROR) {
						return resolve(false);
					}

					return reject(err);
				}

				resolve(true);
			});
		});
	}

	clear (): Promise<void> {
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
