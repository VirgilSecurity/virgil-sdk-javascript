import { SinonStubbedInstance } from 'sinon';
import { KeyEntryStorage } from '../..';
import FileSystemStorageAdapter from '../../KeyStorage/adapters/FileSystemStorageAdapter';
import { InvalidKeyEntryError } from '../../KeyStorage/InvalidKeyEntryError';
import { KeyEntryDoesNotExistError } from '../../KeyStorage/KeyEntryDoesNotExistError';
import { KeyEntryAlreadyExistsError } from '../../KeyStorage/KeyEntryAlreadyExistsError';

describe ('KeyEntryStorage', () => {
	let storage: KeyEntryStorage;
	let adapterStub: SinonStubbedInstance<FileSystemStorageAdapter>;

	beforeEach(() => {
		adapterStub = sinon.createStubInstance(FileSystemStorageAdapter);
		storage = new KeyEntryStorage({
			adapter: adapterStub
		});
	});

	describe ('exists', () => {
		it ('throws if name is empty', () => {
			assert.throws(() => {
				// should throw synchronously
				storage.exists('');
			}, TypeError);
		});

		it ('queries the adapter', () => {
			adapterStub.exists.resolves(true);
			return storage.exists('one').then(exists => {
				assert.isTrue(exists);
				assert.isTrue(adapterStub.exists.withArgs('one').calledOnce);
			});
		});
	});

	describe ('save', () => {
		it ('throws if `name` is empty', () => {
			assert.throws(() => {
				storage.save({ name: '', value: Buffer.from('') });
			}, TypeError);
		});

		it ('throws if `params.value` is empty', () => {
			assert.throws(() => {
				storage.save({ name: 'test_entry', value: undefined! });
			}, TypeError);
		});

		it ('serializes entry to json and forwards to adapter', () => {
			adapterStub.store.resolves();
			const expectedName = 'one';
			const expectedValue = Buffer.from('one');
			const expectedMeta = { meta: 'data' };

			return storage.save({
				name: expectedName,
				value: expectedValue,
				meta: expectedMeta
			}).then(() => {
				assert.equal(adapterStub.store.firstCall.args[0], expectedName);
				assert.isTrue(Buffer.isBuffer(adapterStub.store.firstCall.args[1]));

				const storedObject = JSON.parse(adapterStub.store.firstCall.args[1].toString());
				assert.equal(storedObject.name, expectedName);
				assert.equal(storedObject.value, expectedValue.toString('base64'));
				assert.deepEqual(storedObject.meta, expectedMeta);
			});
		});

		it ('throws `PrivateKeyExistsError` if entry with the same name already exists', () => {
			adapterStub.store.rejects({ name: 'StorageEntryAlreadyExistsError' });
			return assert.isRejected(
				storage.save({ name: 'one', value: Buffer.from('one') }),
				KeyEntryAlreadyExistsError
			);
		});

		it ('re-throws unexpected errors from adapter', () => {
			adapterStub.store.rejects({ code: 'UNKNOWN', message: 'unknown error' });
			return assert.isRejected(
				storage.save({ name: 'one', value: Buffer.from('one') }),
				/unknown error/
			);
		});

		it ('sets creationDate and modificationDate properties', () => {
			adapterStub.store.resolves();

			return storage.save({ name: 'test', value: Buffer.from('test') })
				.then(entry => {
					assert.approximately(entry.creationDate.getTime(), Date.now(), 1000);
					assert.equal(entry.modificationDate.getTime(), entry.creationDate.getTime());
				});
		});
	});

	describe ('load', () => {
		it ('throws if name is empty', () => {
			assert.throws(() => {
				// should throw synchronously
				storage.load('');
			}, TypeError);
		});

		it ('returns null if entry is not found', () => {
			adapterStub.load.withArgs('any').resolves(null);
			return assert.becomes(storage.load('any'), null);
		});

		it ('de-serializes entry returned from adapter', () => {
			adapterStub.load.withArgs('one')
				.resolves(Buffer.from('{"name":"one","value":"b25l"}')); // "b25l" === base64("one")
			return storage.load('one').then(loadedEntry => {
				assert.isNotNull(loadedEntry);
				assert.equal(loadedEntry!.name, 'one');
				assert.isTrue(loadedEntry!.value.equals(Buffer.from('one')));
			});
		});

		it ('throws if loaded entry is not a valid JSON', () => {
			adapterStub.load.withArgs('one').resolves(Buffer.from('not_json'));
			return assert.isRejected(
				storage.load('one'),
				InvalidKeyEntryError
			);
		});
	});

	describe ('list', () => {
		it ('de-serializes entries returned from adapter', () => {
			adapterStub.list.resolves([
				Buffer.from('{"name":"one","value":"b25l"}'), // "b25l" === base64("one")
				Buffer.from('{"name":"two","value":"dHdv"}'), // "dHdv" === base64("two")
				Buffer.from('{"name":"three","value":"dGhyZWU="}') // "dGhyZWU=" === base64("three")
			]);

			const expectedEntries = [
				{ name: 'one', value: Buffer.from('one') },
				{ name: 'two', value: Buffer.from('two') },
				{ name: 'three', value: Buffer.from('three') },
			];

			return storage.list().then(loadedEntries => {
				assert.equal(loadedEntries.length, 3);
				assert.sameDeepMembers(loadedEntries, expectedEntries);
			});
		});

		it ('throws if any of the entries is not a valid json', () => {
			adapterStub.list.resolves([
				Buffer.from('not_json'),
				Buffer.from('{"name":"three","value":"dGhyZWU="}') // "dGhyZWU=" === base64("three")
			]);

			return assert.isRejected(
				storage.list(),
				InvalidKeyEntryError
			);
		});
	});

	describe ('update', () => {
		it ('throws if `name` is empty', () => {
			assert.throws(() => {
				storage.update({ name: '', value: Buffer.from('') });
			}, TypeError);
		});

		it ('throws if both `value` and `meta` are empty', () => {
			assert.throws(() => {
				storage.update({ name: 'test_entry', value: undefined! });
			}, TypeError);
		});

		it ('throws if entry does not exist', () => {
			adapterStub.load.withArgs('one').resolves(null);
			return assert.isRejected(
				storage.update({ name: 'one', value: Buffer.from('one') }),
				KeyEntryDoesNotExistError
			);
		});

		it ('serializes and forwards updated entry to adapter', () => {
			adapterStub.load
				.withArgs('one')
				.resolves(Buffer.from('{"name":"one","value":"b25l"}')); // b25l = base64(one)
			adapterStub.update.resolves();

			const expectedValue = Buffer.from('another');
			const expectedMeta = { 'foo': 'bar' };

			return storage.update({ name: 'one', value: expectedValue, meta: expectedMeta })
				.then(() => {
					assert.equal(adapterStub.update.firstCall.args[0], 'one');
					assert.isTrue(Buffer.isBuffer(adapterStub.update.firstCall.args[1]));

					const actualEntry = JSON.parse(adapterStub.update.firstCall.args[1].toString());
					assert.equal(actualEntry.name, 'one');
					assert.equal(actualEntry.value, expectedValue.toString('base64'));
					assert.deepEqual(actualEntry.meta, expectedMeta);
					assert.isDefined(actualEntry.modificationDate);
				});
		});

		it ('updates modification date', () => {
			adapterStub.load
				.withArgs('one')
				.resolves(
					Buffer.from(
						'{"name":"one","value":"b25l","modificationDate":"2018-07-27T10:58:21.713Z"}'
					)
				); // b25l = base64(one)
			adapterStub.update.resolves();

			return storage.update({ name: 'one', value: Buffer.from('another') })
				.then(updatedEntry => {
					assert.notEqual(updatedEntry.modificationDate, new Date("2018-07-27T10:58:21.713Z"));
				});
		});

		it ('does not overwrite original meta if new meta is not provided', () => {
			adapterStub.load
				.withArgs('one')
				.resolves(
					Buffer.from(
						'{"name":"one","value":"b25l","meta":{"original":"meta"}}'
					)
				); // b25l = base64(one)
			adapterStub.update.resolves();
			return storage.update({ name: 'one', value: Buffer.from('another') })
				.then(updatedEntry => {
					assert.deepEqual(updatedEntry.meta, { original: 'meta' });
					assert.equal(updatedEntry.value.toString(), 'another');
				});
		});

		it ('does not overwrite original value if new value is not provided', () => {
			adapterStub.load
				.withArgs('one')
				.resolves(
					Buffer.from(
						'{"name":"one","value":"b25l","meta":{"original":"meta"}}'
					)
				); // b25l = base64(one)
			adapterStub.update.resolves();
			return storage.update({ name: 'one', meta: { updated: 'meta' } })
				.then(updatedEntry => {
					assert.equal(updatedEntry.value.toString(), 'one');
					assert.deepEqual(updatedEntry.meta, { updated: 'meta' });
				});
		});
	});
});
