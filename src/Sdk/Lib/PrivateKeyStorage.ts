import { IPrivateKeyExporter } from '../../CryptoApi/IPrivateKeyExporter';
import { IKeyStorage } from './KeyStorage/IKeyStorage';
import { IPrivateKey } from '../../CryptoApi/IPrivateKey';
import { KeyStorage } from './KeyStorage/KeyStorage';

export interface IPrivateKeyEntry {
	privateKey: IPrivateKey,
	meta?: { [key: string]: string }
}

export class PrivateKeyStorage {
	constructor (
		private privateKeyExporter: IPrivateKeyExporter,
		private storageBackend: IKeyStorage = new KeyStorage()
	) {}

	store (name: string, privateKey: IPrivateKey, meta?: { [key: string]: string }) {
		const privateKeyData = this.privateKeyExporter.exportPrivateKey(privateKey);
		return this.storageBackend.save({
			name,
			value: privateKeyData,
			meta
		});
	}

	load (name: string): Promise<IPrivateKeyEntry|null> {
		return this.storageBackend.load(name).then(keyEntry => {
			if (keyEntry === null) {
				return null;
			}

			const privateKey = this.privateKeyExporter.importPrivateKey(keyEntry.value);
			return {
				privateKey,
				meta: keyEntry.meta
			};
		});
	}

	delete (name: string) {
		return this.storageBackend.remove(name);
	}
}
