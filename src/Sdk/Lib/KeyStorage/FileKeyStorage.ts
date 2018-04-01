import { IKeyStorage } from './IKeyStorage';

// todo: correct imports
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var utils = require('../../shared/utils');

export interface IFileKeyStorageConfig {
	dir: string;
	encoding: string|null;
}

const defaults: IFileKeyStorageConfig = {
	dir: process.cwd(),
	encoding: null
};

export class FileKeyStorage implements IKeyStorage {
	private store: any;
	private config: IFileKeyStorageConfig;

	constructor (config: IFileKeyStorageConfig|string) {
		this.config = typeof config === 'string'
			? { ...defaults, dir: config }
			: { ...defaults, ...(config || {}) };

		mkdirp.sync(this.config.dir);
	}

	public async exists(name: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.access(path, err => {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(false);
					} else {
						reject(err);
					}
				} else {
					resolve(true);
				}
			});
		});
	}

	public async load(name: string): Promise<Buffer> {
		return new Promise<Buffer>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.readFile(file, this.config.encoding, (err, data) => {
				if (err) {
					if (err.code === 'ENOENT') {
						resolve(null as any);
					} else {
						reject(err);
					}
					return;
				}

				resolve(data);
			});
		});
	}

	public async remove(name: string): Promise<void> { // todo: should it be Promise<bool> ?
		return new Promise<void>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.unlink(file, err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public async save(name: string, privateKeyData: Buffer): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			const file = this.resolveFilePath(name);

			fs.writeFile(file, privateKeyData, this.config.encoding, err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	private resolveDir (dir: string) {
		dir = path.normalize(dir);

		if (path.isAbsolute(dir)) {
			return dir;
		}

		return path.join(process.cwd(), dir);
	}

	private resolveFilePath (key: string): string {
		return path.join(this.config.dir, this.hash(key));
	}

	private hash (data: string): string {
		return crypto
			.createHash('sha256')
			.update(data)
			.digest('hex');
	}
}