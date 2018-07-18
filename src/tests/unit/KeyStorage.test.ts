import { SinonStubbedInstance } from 'sinon';
import { KeyStorage } from '../../Sdk/Lib/KeyStorage/KeyStorage';
import FileSystemStorageAdapter from '../../Sdk/Lib/KeyStorage/adapters/FileSystemStorageAdapter';
import { PrivateKeyExistsError } from '../../Sdk/Lib/KeyStorage/PrivateKeyExistsError';

describe ('KeyStorage', () => {
	let storage: KeyStorage;
	let adapterSub: SinonStubbedInstance<FileSystemStorageAdapter>;

	beforeEach(() => {
		adapterSub = sinon.createStubInstance(FileSystemStorageAdapter);
		storage = new KeyStorage({
			adapter: adapterSub
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
			adapterSub.exists.resolves(true);
			return storage.exists('one').then(exists => {
				assert.isTrue(exists);
				assert.isTrue(adapterSub.exists.withArgs('one').calledOnce);
			});
		});
	});

	describe ('save', () => {
		it ('throws if name is empty', () => {
			assert.throws(() => {
				storage.save('', Buffer.from('one'));
			}, TypeError);
		});

		it ('throws if data is empty', () => {
			assert.throws(() => {
				storage.save('one', null!);
			}, TypeError);
		});

		it ('serializes entry to json and forwards to adapter', () => {
			adapterSub.store.resolves();
			const expectedName = 'one';
			const expectedValue = Buffer.from('one');

			return storage.save(expectedName, expectedValue).then(() => {
				assert.equal(adapterSub.store.firstCall.args[0], expectedName);
				assert.equal(adapterSub.store.firstCall.args[1], expectedValue);
			});
		});

		it ('throws `PrivateKeyExistsError` if entry with the same name already exists', () => {
			adapterSub.store.rejects({ code: 'EEXIST' });
			return assert.isRejected(
				storage.save('one', Buffer.from('one')),
				PrivateKeyExistsError
			);
		});

		it ('re-throws unexpected errors from adapter', () => {
			adapterSub.store.rejects({ code: 'UNKNOWN', message: 'unknown error' });
			return assert.isRejected(
				storage.save('one', Buffer.from('one')),
				/unknown error/
			);
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
			adapterSub.load.withArgs('any').resolves(null);
			return assert.becomes(storage.load('any'), null);
		});
	});
});
