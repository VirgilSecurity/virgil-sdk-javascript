import { Buffer as NodeBuffer } from '@virgilsecurity/data-utils';

import { isIndexedDbValid } from './indexedDb/isIndexedDbValid';
import { IStorageAdapter, IStorageAdapterConfig } from './IStorageAdapter';
import { StorageEntryAlreadyExistsError } from './errors';

// Some code originally from localForage in
// [localForage](https://github.com/localForage/localForage).

// Transaction Modes
const READ_ONLY = 'readonly';
const READ_WRITE = 'readwrite';

type DeferredOperation = {
	resolve(val?: any): void;
	reject(err: Error): void;
	promise: Promise<any>;
}

type DbContext = {
	db: IDBDatabase|null,
	// Database readiness (promise).
	dbReady: Promise<any>|null,
	// Deferred operations on the database.
	deferredOperations: DeferredOperation[]
}

type DbInfo = {
	db: IDBDatabase|null,
	name: string,
	version?: number,
	storeName: string;
};

const dbContexts: { [name: string]: DbContext } = {};

/**
 * Implementation of {@link IStorageAdapter} that uses IndexedDB for
 * persistence. For use in browsers.
 */
export default class IndexedDbStorageAdapter implements IStorageAdapter {

	private _dbInfo?: DbInfo;

	private _defaultConfig: { name: string, version: number, storeName: string };

	private _ready: Promise<void>;

	/**
	 * Initializes an instance of `IndexedDbStorageAdapter`.
	 * @param {IStorageAdapterConfig} config - Configuration options.
	 * Currently only `name` is supported and must be the name of the
	 * IndexedDB database where the data will be stored.
	 */
	constructor(config: IStorageAdapterConfig) {
		if (!isIndexedDbValid()) {
			throw new Error('Cannot use IndexedDbStorageAdapter. indexedDb is not supported');
		}

		this._defaultConfig = {
			name: config.name,
			version: 1,
			storeName: 'keyvaluepairs'
		};

		this._ready = this._initStorage();
	}

	/**
	 * @inheritDoc
	 */
	store (key: string, data: Buffer): Promise<void> {
		key = normalizeKey(key);

		return new Promise((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_WRITE, (err, transaction ) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.add(toArrayBuffer(data), key);

						transaction!.oncomplete = () => {
							resolve();
						};

						transaction!.onabort = transaction!.onerror = () => {
							let error: any = req.error
								? req.error
								: req.transaction!.error;

							if (error && error.name === 'ConstraintError') {
								reject(new StorageEntryAlreadyExistsError(key));
							}

							reject(error);
						};
					} catch (error) {
						reject(error);
					}
				});
			}).catch(reject);
		});
	}

	/**
	 * @inheritDoc
	 */
	load (key: string): Promise<Buffer|null> {
		key = normalizeKey(key);

		return new Promise((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_ONLY, (err, transaction ) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.get(key);

						req.onsuccess = function() {
							if (req.result == null) {
								return resolve(null);
							}

							const arrayBuffer = req.result;
							const buffer = NodeBuffer.from(arrayBuffer);
							resolve(buffer);
						};

						req.onerror = function() {
							reject(req.error);
						};
					} catch (e) {
						reject(e);
					}
				});
			}).catch(reject)
		});
	}

	/**
	 * @inheritDoc
	 */
	exists(key: string): Promise<boolean> {
		key = normalizeKey(key);
		return new Promise<boolean>((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_ONLY, (err, transaction) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.openCursor(key);

						req.onsuccess = () => {
							const cursor = req.result;
							resolve(cursor !== null);
						};

						req.onerror = () => {
							reject(req.error);
						};
					} catch (e) {
						reject(e);
					}
				})
			}).catch(reject);
		});
	}

	/**
	 * @inheritDoc
	 */
	remove(key: string): Promise<boolean> {
		key = normalizeKey(key);
		return new Promise<boolean>((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_WRITE, (err, transaction) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const countReq = store.count(key);
						let delReq: IDBRequest;

						countReq.onsuccess = () => {
							const count = countReq.result;
							if (count === 0) {
								return resolve(false);
							}

							// safe for IE and some versions of Android
							// (including those used by Cordova).
							// Normally IE won't like `.delete()` and will insist on
							// using `['delete']()`
							delReq = store['delete'](key);
							delReq.onsuccess = () => resolve(true);
						};

						// The request will be also be aborted if we've exceeded our storage
						// space.
						transaction!.onabort = transaction!.onerror = () => {
							const req = delReq || countReq;
							const err = req.error
								? req.error
								: req.transaction!.error;
							reject(err);
						};
					} catch (e) {
						reject(e);
					}
				})
			}).catch(reject);
		});
	}

	/**
	 * @inheritDoc
	 */
	update (key: string, data: Buffer): Promise<void> {
		key = normalizeKey(key);
		return new Promise((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_WRITE, (err, transaction ) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.put(toArrayBuffer(data), key);

						req.onsuccess = () => {
							resolve();
						};

						req.onerror = () => {
							reject(req.error);
						};
					} catch (error) {
						reject(error);
					}
				});
			}).catch(reject);
		});
	}

	/**
	 * @inheritDoc
	 */
	clear(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_WRITE, (err, transaction) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.clear();

						transaction!.oncomplete = () => resolve();

						transaction!.onabort = transaction!.onerror = () => {
							const err = req.error
								? req.error
								: req.transaction!.error;
							reject(err);
						};
					} catch (e) {
						reject(e);
					}
				});
			}).catch(reject);
		});
	}

	/**
	 * @inheritDoc
	 */
	list(): Promise<Buffer[]> {
		return new Promise((resolve, reject) => {
			this.ready().then(() => {
				createTransaction(this._dbInfo!, READ_ONLY, (err, transaction) => {
					if (err) {
						return reject(err);
					}

					try {
						const store = transaction!.objectStore(this._dbInfo!.storeName!);
						const req = store.openCursor();

						const entries: Buffer[] = [];

						req.onsuccess = () => {
							const cursor = req.result;
							if (!cursor) {
								resolve(entries);
							} else {
								entries.push(NodeBuffer.from(cursor.value));
								cursor.continue();
							}
						};

						req.onerror = () => {
							reject(req.error);
						};
					} catch (e) {
						reject(e);
					}
				});
			}).catch(reject);
		});
	}

	// Open the IndexedDB database (automatically creates one if one didn't
	// previously exist), using any options set in the config.
	private _initStorage = () => {
		const dbInfo: DbInfo = {
			db: null,
			name: this._defaultConfig.name,
			storeName: this._defaultConfig.storeName,
			version: this._defaultConfig.version
		};

		// Get the current context of the database;
		let dbContext = dbContexts[dbInfo.name];

		// ...or create a new context.
		if (!dbContext) {
			dbContext = createDbContext();
			// Register the new context in the global container.
			dbContexts[dbInfo.name] = dbContext;
		}

		// Initialize the connection process only when
		// all the related storages aren't pending.
		return Promise.resolve()
			.then(() => {
				dbInfo.db = dbContext.db;
				// Get the connection or open a new one without upgrade.
				return _getOriginalConnection(dbInfo);
			})
			.then(db => {
				dbInfo.db = db;
				if (_isUpgradeNeeded(dbInfo, this._defaultConfig.version)) {
					// Reopen the database for upgrading.
					return _getUpgradedConnection(dbInfo);
				}
				return db;
			})
			.then(db => {
				dbInfo.db = dbContext.db = db;
				this._dbInfo = dbInfo;
			});
	}

	// Specialize the default `ready()` function by making it dependent
	// on the current database operations. Thus, the driver will be actually
	// ready when it's been initialized (default) *and* there are no pending
	// operations on the database (initiated by some other instances).
	private ready = () => {
		const promise = this._ready.then(() => {
			const dbContext = dbContexts[this._dbInfo!.name];

			if (dbContext && dbContext.dbReady) {
				return dbContext.dbReady;
			}
		});

		return promise;
	}
}

function createDbContext(): DbContext {
	return {
		// Database.
		db: null,
		// Database readiness (promise).
		dbReady: null,
		// Deferred operations on the database.
		deferredOperations: []
	};
}

function _deferReadiness(dbInfo: DbInfo) {
	const dbContext = dbContexts[dbInfo.name];

	// Create a deferred object representing the current database operation.
	const deferredOperation = {} as DeferredOperation;

	deferredOperation.promise = new Promise((resolve, reject) => {
		deferredOperation.resolve = resolve;
		deferredOperation.reject = reject;
	});

	// Enqueue the deferred operation.
	dbContext.deferredOperations.push(deferredOperation);

	// Chain its promise to the database readiness.
	if (!dbContext.dbReady) {
		dbContext.dbReady = deferredOperation.promise;
	} else {
		dbContext.dbReady = dbContext.dbReady.then(() => deferredOperation.promise);
	}
}

function _advanceReadiness(dbInfo: DbInfo) {
	const dbContext = dbContexts[dbInfo.name];

	// Dequeue a deferred operation.
	const deferredOperation = dbContext.deferredOperations.pop();

	// Resolve its promise (which is part of the database readiness
	// chain of promises).
	if (deferredOperation) {
		deferredOperation.resolve();
		return deferredOperation.promise;
	}
}

function _rejectReadiness(dbInfo: DbInfo, err: Error) {
	const dbContext = dbContexts[dbInfo.name];

	// Dequeue a deferred operation.
	const deferredOperation = dbContext.deferredOperations.pop();

	// Reject its promise (which is part of the database readiness
	// chain of promises).
	if (deferredOperation) {
		deferredOperation.reject(err);
		return deferredOperation.promise;
	}
}

function _getConnection(dbInfo: DbInfo, upgradeNeeded: boolean): Promise<IDBDatabase> {
	return new Promise(function(resolve, reject) {
		dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

		if (dbInfo.db) {
			if (upgradeNeeded) {
				_deferReadiness(dbInfo);
				dbInfo.db.close();
			} else {
				return resolve(dbInfo.db);
			}
		}

		const dbArgs: [string, (number|undefined)?] = [dbInfo.name];

		if (upgradeNeeded) {
			dbArgs.push(String(dbInfo.version));
		}

		const openReq = indexedDB.open.apply(indexedDB, dbArgs);

		if (upgradeNeeded) {
			openReq.onupgradeneeded = (e: IDBVersionChangeEvent) => {
				const db = openReq.result;
				try {
					db.createObjectStore(dbInfo.storeName);
				} catch (ex) {
					if (ex.name === 'ConstraintError') {
						console.warn(
							'The database "' +
							dbInfo.name +
							'"' +
							' has been upgraded from version ' +
							e.oldVersion +
							' to version ' +
							e.newVersion +
							', but the storage "' +
							dbInfo.storeName +
							'" already exists.'
						);
					} else {
						throw ex;
					}
				}
			};
		}

		openReq.onerror = (e: Event) => {
			e.preventDefault();
			reject(openReq.error);
		};

		openReq.onsuccess = () => {
			resolve(openReq.result);
			_advanceReadiness(dbInfo);
		};
	});
}

function _getOriginalConnection(dbInfo: DbInfo) {
	return _getConnection(dbInfo, false);
}

function _getUpgradedConnection(dbInfo: DbInfo) {
	return _getConnection(dbInfo, true);
}

function _isUpgradeNeeded(dbInfo: DbInfo, defaultVersion?: number) {
	if (!dbInfo.db) {
		return true;
	}

	const isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName!);
	const isDowngrade = dbInfo.version! < dbInfo.db.version;
	const isUpgrade = dbInfo.version! > dbInfo.db.version;

	if (isDowngrade) {
		// If the version is not the default one
		// then warn for impossible downgrade.
		if (dbInfo.version !== defaultVersion) {
			console.warn(
				'The database "' +
				dbInfo.name +
				'"' +
				" can't be downgraded from version " +
				dbInfo.db.version +
				' to version ' +
				dbInfo.version +
				'.'
			);
		}
		// Align the versions to prevent errors.
		dbInfo.version = dbInfo.db.version;
	}

	if (isUpgrade || isNewStore) {
		// If the store is new then increment the version (if needed).
		// This will trigger an "upgradeneeded" event which is required
		// for creating a store.
		if (isNewStore) {
			const incVersion = dbInfo.db.version + 1;
			if (incVersion > dbInfo.version!) {
				dbInfo.version = incVersion;
			}
		}

		return true;
	}

	return false;
}

// Try to establish a new db connection to replace the
// current one which is broken (i.e. experiencing
// InvalidStateError while creating a transaction).
function _tryReconnect(dbInfo: DbInfo) {
	_deferReadiness(dbInfo);

	const dbContext = dbContexts[dbInfo.name];
	dbInfo.db = null;

	return _getOriginalConnection(dbInfo)
		.then(db => {
			dbInfo.db = db;
			if (_isUpgradeNeeded(dbInfo)) {
				// Reopen the database for upgrading.
				return _getUpgradedConnection(dbInfo);
			}
			return db;
		})
		.then(db => {
			// store the latest db reference
			// in case the db was upgraded
			dbInfo.db = dbContext.db = db;
		})
		.catch(err => {
			_rejectReadiness(dbInfo, err);
			throw err;
		});
}

// FF doesn't like Promises (micro-tasks) and IDDB store operations,
// so we have to do it with callbacks
function createTransaction(
	dbInfo: DbInfo,
	mode: IDBTransactionMode,
	callback: (err: Error|null, tx?: IDBTransaction) => void,
	retries?: number
) {
	if (retries === undefined) {
		retries = 1;
	}

	try {
		const tx = dbInfo.db!.transaction(dbInfo.storeName!, mode);
		callback(null, tx);
	} catch (err) {
		if (
			retries > 0 &&
			(!dbInfo.db ||
				err.name === 'InvalidStateError' ||
				err.name === 'NotFoundError')
		) {
			Promise.resolve()
				.then(() => {
					if (
						!dbInfo.db ||
						(err.name === 'NotFoundError' &&
							!dbInfo.db.objectStoreNames.contains(dbInfo.storeName!) &&
							(dbInfo.version as number) <= dbInfo.db.version)
					) {
						// increase the db version, to create the new ObjectStore
						if (dbInfo.db) {
							dbInfo.version = dbInfo.db.version + 1;
						}
						// Reopen the database for upgrading.
						return _getUpgradedConnection(dbInfo) as Promise<any>;
					}
				})
				.then(() => {
					return _tryReconnect(dbInfo).then(function() {
						createTransaction(dbInfo, mode, callback, retries! - 1);
					});
				})
				.catch(callback);
		}

		callback(err);
	}
}

function normalizeKey(key: any) {
	// Cast the key to a string, as that's all we can set as a key.
	if (typeof key !== 'string') {
		console.warn(`${key} used as a key, but it is not a string.`);
		key = String(key);
	}

	return key;
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

	if (NodeBuffer.isBuffer(buf)) {
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
