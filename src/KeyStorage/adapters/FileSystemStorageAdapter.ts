import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import { IStorageAdapter, IStorageAdapterConfig } from './IStorageAdapter';
import { StorageEntryAlreadyExistsError } from '../StorageEntryAlreadyExistsError';

const NO_SUCH_FILE = 'ENOENT';
const FILE_EXISTS = 'EEXIST';

/**
 * Implementation of {@link IStorageAdapter} that uses file system for
 * persistence. For use in Node.js.
 */
export default class FileSystemStorageAdapter implements IStorageAdapter {

	private config: IStorageAdapterConfig;

	/**
	 * Initializes a new instance of `FileSystemStorageAdapter`.
	 * @param {IStorageAdapterConfig} config - Configuration options.
	 * Currently only `dir` is supported and must be a file system path
	 * to the folder where the data will be stored.
	 */
	constructor (config: IStorageAdapterConfig) {
		this.config = config;

		mkdirp.sync(path.resolve(this.config.dir));
	}

	/**
	 * @inheritDoc
	 */
	store(key: string, data: Buffer): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const file = this.resolveFilePath(key);

			fs.writeFile(file, data, { flag: 'wx' }, err => {
				if (err && err.code === FILE_EXISTS) {
					return reject(new StorageEntryAlreadyExistsError());
				}

				resolve();
			});
		});
	}

	/**
	 * @inheritDoc
	 */
	load(key: string): Promise<Buffer|null> {
		return Promise.resolve().then(() => {
			const filename = this.resolveFilePath(key);
			return readFileAsync(filename);
		});
	}

	/**
	 * @inheritDoc
	 */
	exists(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(key);

			fs.access(file, err => {
				if (err) {
					if (err.code === NO_SUCH_FILE) {
						return resolve(false);
					}
					return reject(err);
				}

				resolve(true);
			});
		});
	}

	/**
	 * @inheritDoc
	 */
	remove(key: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(key);
			fs.unlink(file, err => {
				if (err) {
					if (err.code === NO_SUCH_FILE) {
						return resolve(false);
					}

					return reject(err);
				}

				resolve(true);
			});
		});
	}

	/**
	 * @inheritDoc
	 */
	update (key: string, data: Buffer): Promise<void> {
		return new Promise((resolve, reject) => {
			const file = this.resolveFilePath(key);
			fs.writeFile(file, data, { flag: 'w' }, err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	}

	/**
	 * @inheritDoc
	 */
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

	/**
	 * @inheritDoc
	 */
	list (): Promise<Buffer[]> {
		return new Promise((resolve, reject) => {
			fs.readdir(this.config.dir, (err, files) => {
				if (err) {
					return reject(err);
				}

				Promise.all(
					files.map(filename =>
						readFileAsync(path.resolve(this.config.dir!, filename))
					)
				).then(contents => {
					const entries = contents
						.filter(content => content !== null)
						.map(content => content as Buffer);

					resolve(entries);
				}).catch(reject);
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

function readFileAsync (filename: string): Promise<Buffer|null> {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, (err, data) => {
			if (err) {
				if (err.code === NO_SUCH_FILE) {
					return resolve(null as any);
				}

				return reject(err);
			}

			resolve(data);
		});
	});
}
