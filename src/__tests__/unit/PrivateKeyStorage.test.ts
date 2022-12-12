// @ts-nocheck
import { KeyEntryStorage, PrivateKeyStorage } from '../..';
import { SinonStubbedInstance } from 'sinon';
import { IPrivateKeyExporter } from '../../types';
import { IKeyEntryStorage } from '../../Storage/KeyEntryStorage/IKeyEntryStorage';
import { PrivateKeyExistsError } from '../../Storage/errors';
import { IPrivateKey } from '../../types';
import { NodeBuffer } from "@virgilsecurity/data-utils";

describe ('PrivateKeyStorage', () => {
	let privateKeyStorage: PrivateKeyStorage;
	let storageBackendStub: SinonStubbedInstance<IKeyEntryStorage>;
	let privateKeyExporterStub: SinonStubbedInstance<IPrivateKeyExporter>;

	beforeEach(() => {
		storageBackendStub = sinon.createStubInstance(KeyEntryStorage);
		privateKeyExporterStub = {
			exportPrivateKey: sinon.stub(),
			importPrivateKey: sinon.stub()
		};
		console.log(storageBackendStub)
		console.log(privateKeyExporterStub)
		privateKeyStorage = new PrivateKeyStorage(privateKeyExporterStub, storageBackendStub);
		console.log(privateKeyStorage)
	});

	describe ('store', () => {
		it ('exports private key data before saving', () => {
			const privateKey = Buffer.from('private_key');
			privateKeyExporterStub.exportPrivateKey.returns(privateKey);
			storageBackendStub.save.resolves();
			return privateKeyStorage.store('test', {} as IPrivateKey, { meta: 'data' })
				.then(() => {
					assert.isTrue(storageBackendStub.save.calledOnce);
					const entry = storageBackendStub.save.firstCall.args[0];
					assert.equal(entry.name, 'test');
					assert.equal(entry.value, privateKey.toString('base64'));
					assert.deepEqual(entry.meta, { meta: 'data' });
				});
		});

		it ('throws if private key with the same name already exists', () => {
			privateKeyExporterStub.exportPrivateKey.returns(Buffer.from('private_key'));
			storageBackendStub.save.rejects({ name: 'KeyEntryAlreadyExistsError' });
			return assert.isRejected(
				privateKeyStorage.store('test', {} as IPrivateKey),
				PrivateKeyExistsError
			);
		});
	});

	describe ('load', () => {
		it ('imports private key data before returning', () => {
			const thePrivateKey = {};
			privateKeyExporterStub.importPrivateKey.returns(thePrivateKey as IPrivateKey);
			storageBackendStub.load.withArgs('test').resolves({
				name: 'test',
				value: Buffer.from('private_key') as unknown as string,
				creationDate: new Date(),
				modificationDate: new Date(),
				meta: { meta: 'data' }
			});

			return privateKeyStorage.load('test').then(loadedEntry => {
				assert.isNotNull(loadedEntry);
				assert.strictEqual(loadedEntry!.privateKey, thePrivateKey);
				assert.deepEqual(loadedEntry!.meta, { meta: 'data' });
			});
		});

		it ('returns null if entry is not found', () => {
			storageBackendStub.load.withArgs('test').resolves(null);
			return assert.becomes(privateKeyStorage.load('test'), null);
		});
	});
});
