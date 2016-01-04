import VirgilCrypto from '../../lib/crypto-module';
import * as CryptoUtils from '../../lib/crypto-utils';
import { throwVirgilError } from '../../lib/crypto-errors';

export function decryptWithKey (initialEncryptedData, recipientId, privateKey, privateKeyPassword = '') {
	let virgilCipher = new VirgilCrypto.VirgilCipher();
	let decryptedDataBuffer;

	try {
		let recipientIdByteArray = CryptoUtils.toByteArray(recipientId);
		let dataByteArray = CryptoUtils.toByteArray(initialEncryptedData);
		let privateKeyByteArray = CryptoUtils.toByteArray(privateKey);
		let privateKeyPasswordByteArray = CryptoUtils.toByteArray(privateKeyPassword);
		let decryptedDataByteArray = virgilCipher.decryptWithKey(dataByteArray, recipientIdByteArray, privateKeyByteArray, privateKeyPasswordByteArray);
		decryptedDataBuffer = CryptoUtils.byteArrayToBuffer(decryptedDataByteArray);

		// cleanup memory to avoid memory leaks
		recipientIdByteArray.delete();
		dataByteArray.delete();
		privateKeyByteArray.delete();
		decryptedDataByteArray.delete();
		privateKeyPasswordByteArray.delete();
	} catch (e) {
		throwVirgilError('90002', { initialData: initialEncryptedData, key: privateKey });
	} finally {
		virgilCipher.delete();
	}

	return decryptedDataBuffer;
}

export default decryptWithKey;
