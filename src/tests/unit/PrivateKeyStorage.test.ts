import { KeyEntryStorage, PrivateKeyStorage } from '../..';
import { SinonStubbedInstance } from 'sinon';
import { IPrivateKeyExporter } from '../../CryptoApi/IPrivateKeyExporter';
import { IKeyEntryStorage } from '../../Sdk/Lib/KeyStorage/IKeyEntryStorage';

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

		privateKeyStorage = new PrivateKeyStorage(privateKeyExporterStub, storageBackendStub);
	});

	describe ('store', () => {
		it ('exports private key data before saving', () => {
			privateKeyExporterStub.exportPrivateKey.returns(Buffer.from('private_key'));
			storageBackendStub.save.resolves();
			return privateKeyStorage.store('test', {}, { meta: 'data' })
				.then(() => {
					assert.isTrue(storageBackendStub.save.calledOnce);
					const entry = storageBackendStub.save.firstCall.args[0];
					assert.equal(entry.name, 'test');
					assert.equal(entry.value.toString(), 'private_key');
					assert.deepEqual(entry.meta, { meta: 'data' });
				});
		});
	});

	describe ('load', () => {
		it ('imports private key data before returning', () => {
			const thePrivateKey = {};
			privateKeyExporterStub.importPrivateKey.returns(thePrivateKey);
			storageBackendStub.load.withArgs('test').resolves({
				name: 'test',
				value: Buffer.from('private_key'),
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
