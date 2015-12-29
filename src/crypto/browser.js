// transpilers
import 'babel-core/external-helpers';

// workaround for error: `only one instance of babel/polyfill is allowed`
// so, include the babel/polyfill into build, but load only single instance
if (global && !global._babelPolyfill) {
	require('babel/polyfill');
}

import 'operative';
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;
import VirgilCrypto from '../lib/crypto-module';
import {
	bufferToByteArray,
	stringToByteArray,
	byteArrayToBuffer,
	byteArrayToString,
	toByteArray,
	toBase64,
	base64ToBuffer
} from '../lib/crypto-utils';
import KeysTypesEnum from './keys-types-enum';
import _ from 'lodash';
import browser from 'bowser';
import { getErrorMessage, throwVirgilError, throwValidationError } from '../lib/crypto-errors';

// raw resources
import rawVirgilEmscripten from 'raw!../lib/virgil-emscripten';
import rawWorkerCrypto from 'raw!./worker-crypto-context';

export function blobScript (code) {
	return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

export function createWorkerCryptoFunc (func) {
	return window.operative(func, [blobScript(rawVirgilEmscripten), blobScript(rawWorkerCrypto)]);
}

let isIE = () => browser.msie;

export class Crypto {

	static Version = SDK_VERSION;
	static VirgilCipher = VirgilCrypto.VirgilCipher;
	static VirgilSigner = VirgilCrypto.VirgilSigner;
	static VirgilKeyPair = VirgilCrypto.VirgilKeyPair;
	static VirgilByteArray = VirgilCrypto.VirgilByteArray;
	static VirgilByteArrayToBase64 = VirgilCrypto.VirgilBase64.encode;
	static VirgilByteArrayFromBase64 = VirgilCrypto.VirgilBase64.decode;
	static VirgilByteArrayFromUTF8 = VirgilCrypto.VirgilByteArray.fromUTF8;
	static KeysTypesEnum = KeysTypesEnum;

	/**
	 * Encrypt data using public key
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipientId {string}
	 * @param publicKey {string}
	 * @returns {string} - base64 String!
	 */
	static encryptWithKey (initialData, recipientId, publicKey) {
		if (!_.isString(recipientId)) {
			throwValidationError('00001', { arg: 'recipientId', type: 'String' });
		}

		if (!_.isString(publicKey)) {
			throwValidationError('00001', { arg: 'publicKey', type: 'String' });
		}

		let virgilCipher = new Crypto.VirgilCipher();
		let encryptedDataBase64;

		try {
			let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipientId);
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(btoa(initialData));
			let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(publicKey);

			virgilCipher.addKeyRecipient(recipientIdByteArray, publicKeyByteArray);
			let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, true);
			encryptedDataBase64 = Crypto.VirgilByteArrayToBase64(encryptedDataByteArray);

			// cleanup memory to avoid memory leaks
			recipientIdByteArray.delete();
			dataByteArray.delete();
			encryptedDataByteArray.delete();
		} catch (e) {
			throwVirgilError('90001', { initialData: initialData, key: publicKey });
		} finally {
			virgilCipher.delete();
		}

		return encryptedDataBase64;
	}

	/**
	 * Encrypt data using public key and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipientId {string}
	 * @param publicKey {string}
	 * @returns {Promise}
	 */
	static encryptWithKeyAsync (initialData, recipientId, publicKey) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.encryptWithKey(initialData, recipientId, publicKey));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._encryptWithKeyAsync(initialData, recipientId, publicKey);
		}
	}

	/**
	 * Encrypt data using public key and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipientId {string}
	 * @param publicKey {string}
	 * @returns {Promise}
	 * @private
	 */
	static _encryptWithKeyAsync (initialData, recipientId, publicKey) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'String' });
		}

		if (!_.isString(recipientId)) {
			throwValidationError('00001', { arg: 'recipientId', type: 'String' });
		}

		if (!_.isString(publicKey)) {
			throwValidationError('00001', { arg: 'publicKey', type: 'String' });
		}

		let worker = createWorkerCryptoFunc(function(initialData, recipientId, publicKey) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilCipher = new Crypto.VirgilCipher();

			try {
				let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipientId);
				let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
				let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(publicKey);

				virgilCipher.addKeyRecipient(recipientIdByteArray, publicKeyByteArray);
				let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, true);
				let encryptedDataBase64 = Crypto.VirgilByteArrayToBase64(encryptedDataByteArray);

				// cleanup memory to avoid memory leaks
				recipientIdByteArray.delete();
				dataByteArray.delete();
				encryptedDataByteArray.delete();

				deferred.resolve(encryptedDataBase64);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilCipher.delete();
			}
		});

		return worker(initialData, recipientId, publicKey).catch(() => {
			return getErrorMessage(['crypto', '90001'], { initialData: initialData, key: publicKey });
		});
	}

	/**
	 * Encrypt data using public key
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipients {array}
	 * @returns {string} - base64 String!
	 */
	static encryptWithKeyMultiRecipients (initialData, recipients) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'String' });
		}

		if (!_.isArray(recipients)) {
			throwValidationError('00001', { arg: 'recipients', type: 'Array' });
		}

		if (_.isArray(recipients) && recipients.length === 0) {
			throwValidationError('00002', { arg: 'recipients', type: 'should contain at least one item' });
		}

		_.each(recipients, (recipient) => {
			if (!_.isString(recipient.recipientId)) {
				throwValidationError('00001', { arg: 'recipientId', type: 'String' });
			}

			if (!_.isString(recipient.publicKey)) {
				throwValidationError('00001', { arg: 'publicKey', type: 'String' });
			}
		});

		let virgilCipher = new Crypto.VirgilCipher();
		let encryptedDataBase64;
		let recipientIdsByteArrays = [];

		try {
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);

			_.each(recipients, (recipient) => {
				let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipient.recipientId);
				let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(recipient.publicKey);

				virgilCipher.addKeyRecipient(recipientIdByteArray, publicKeyByteArray);

				recipientIdsByteArrays.push(recipientIdByteArray);
			});

			let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, true);
			encryptedDataBase64 = Crypto.VirgilByteArrayToBase64(encryptedDataByteArray);

			// cleanup memory to avoid memory leaks
			dataByteArray.delete();
			encryptedDataByteArray.delete();
			_.each(recipientIdsByteArrays, (recipientIdByteArray) => recipientIdByteArray.delete());
		} catch (e) {
			throwVirgilError('90008', { initialData: initialData, recipients: recipients });
		} finally {
			virgilCipher.delete();
		}

		return encryptedDataBase64;
	}

	/**
	 * Encrypt data using public key and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipients {array}
	 * @returns {Promise}
	 */
	static encryptWithKeyMultiRecipientsAsync (initialData, recipients) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.encryptWithKeyMultiRecipients(initialData, recipients));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._encryptWithKeyMultiRecipientsAsync(initialData, recipients);
		}
	}

	/**
	 * Encrypt data using public key and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param recipients {array}
	 * @returns {Promise}
	 * @private
	 */
	static _encryptWithKeyMultiRecipientsAsync (initialData, recipients) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'String' });
		}

		if (!_.isArray(recipients)) {
			throwValidationError('00001', { arg: 'recipients', type: 'Array' });
		}

		if (_.isArray(recipients) && recipients.length === 0) {
			throwValidationError('00002', { arg: 'recipients', type: 'should contain at least one item' });
		}

		_.each(recipients, (recipient) => {
			if (!_.isString(recipient.recipientId)) {
				throwValidationError('00001', { arg: 'recipientId', type: 'String' });
			}

			if (!_.isString(recipient.publicKey)) {
				throwValidationError('00001', { arg: 'publicKey', type: 'String' });
			}
		});

		let worker = createWorkerCryptoFunc(function(initialData, recipients) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilCipher = new Crypto.VirgilCipher();
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);

			try {
				let recipientIdsByteArrays = [];

				for (let i = 0, l = recipients.length; i < l; i++) {
					var recipient = recipients[i];

					let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipient.recipientId);
					let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(recipient.publicKey);

					virgilCipher.addKeyRecipient(recipientIdByteArray, publicKeyByteArray);
					recipientIdsByteArrays.push(recipientIdByteArray);
				}

				let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, true);
				let encryptedDataBase64 = Crypto.VirgilByteArrayToBase64(encryptedDataByteArray);

				// cleanup memory to avoid memory leaks
				dataByteArray.delete();
				encryptedDataByteArray.delete();

				for (let j = 0, rsl = recipientIdsByteArrays.length; j < rsl; j++) {
					recipientIdsByteArrays[j].delete();
				}

				deferred.resolve(encryptedDataBase64);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilCipher.delete();
			}
		});

		return worker(initialData, recipients).catch(() => {
			return getErrorMessage(['crypto', '90008'], { initialData: initialData, recipients: recipients });
		});
	}

	/**
	 * Encrypt data using password
	 *
	 * @param initialData {string} - base64 String!
	 * @param [password = ''] {string}
	 * @param [isEmbeddedContentInfo = true] {boolean}
	 * @returns {string} - base64 String!
	 */
	static encryptWithPassword (initialData, password = '', isEmbeddedContentInfo = true) {
		let virgilCipher = new Crypto.VirgilCipher();
		let encryptedDataBuffer;

		try {
			let dataByteArray = toByteArray(initialData);
			let passwordByteArray;

			if (password) {
				passwordByteArray = toByteArray(password);
				virgilCipher.addPasswordRecipient(passwordByteArray);
			}

			let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, isEmbeddedContentInfo);
			encryptedDataBuffer = Buffer(encryptedDataByteArray.data());

			// cleanup memory to avoid memory leaks
			dataByteArray.delete();
			if (passwordByteArray) {
				passwordByteArray.delete();
			}
		} catch (e) {
			throwVirgilError('90003', { initialData: initialData, password: password });
		} finally {
			virgilCipher.delete();
		}

		return encryptedDataBuffer;
	}

	/**
	 * Encrypt data using password and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param [password = ''] {string}
	 * @param [isEmbeddedContentInfo = true] {boolean}
	 * @returns {Promise}
	 */
	static encryptWithPasswordAsync (initialData, password, isEmbeddedContentInfo) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.encryptWithPassword(initialData, password, isEmbeddedContentInfo));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._encryptWithPasswordAsync(initialData, password, isEmbeddedContentInfo);
		}
	}

	/**
	 * Encrypt data using password and using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param [password = ''] {string}
	 * @param [isEmbeddedContentInfo = true] {boolean}
	 * @returns {Promise}
	 * @private
	 */
	static _encryptWithPasswordAsync (initialData, password = '', isEmbeddedContentInfo = true) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'base64 String' });
		}

		let worker = createWorkerCryptoFunc(function(initialData, password, isEmbeddedContentInfo) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilCipher = new Crypto.VirgilCipher();

			try {
				let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
				let passwordByteArray;

				if (password) {
					passwordByteArray = Crypto.VirgilByteArrayFromUTF8(password);
					virgilCipher.addPasswordRecipient(passwordByteArray);
				}

				let encryptedDataByteArray = virgilCipher.encrypt(dataByteArray, isEmbeddedContentInfo);
				let encryptedDataBase64 = Crypto.VirgilByteArrayToBase64(encryptedDataByteArray);

				// cleanup memory to avoid memory leaks
				dataByteArray.delete();
				if (passwordByteArray) {
					passwordByteArray.delete();
				}

				deferred.resolve(encryptedDataBase64);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilCipher.delete();
			}
		});

		return worker(initialData, password, isEmbeddedContentInfo).catch(() => {
			return getErrorMessage(['crypto', '90003'], { initialData: initialData, password: password });
		});
	}

	/**
	 * Encrypt data
	 *
	 * @param initialData string - base64 string!
	 * @param recipient {string|array}
	 * @param [publicKey] {string}
	 *
	 * @returns {string} - base64 string!
	 */
	static encrypt (initialData, recipient, publicKey) {
		let encryptedData;

		if (_.isArray(recipient)) {
			let recipients = recipient;

			encryptedData = Crypto.encryptWithKeyMultiRecipients(initialData, recipients);
		} else if (_.isString(recipient) && _.isString(publicKey)) {
			encryptedData = Crypto.encryptWithKey(initialData, recipient, publicKey);
		} else {
			let password = recipient;
			let isEmbeddedContentInfo = publicKey;

			encryptedData = Crypto.encryptWithPassword(initialData, password, isEmbeddedContentInfo);
		}

		return encryptedData;
	}

	/**
	 * Encrypt data async
	 *
	 * @param initialData string - base64 string!
	 * @param recipient {string|array}
	 * @param [publicKey] {string}
	 *
	 * @returns {Promise}
	 */
	static encryptAsync (initialData, recipient, publicKey) {
		let encryptedDataPromise;

		if (_.isArray(recipient)) {
			let recipients = recipient;

			encryptedDataPromise = Crypto.encryptWithKeyMultiRecipientsAsync(initialData, recipients);
		} else if (_.isString(recipient) && _.isString(publicKey)) {
			encryptedDataPromise = Crypto.encryptWithKeyAsync(initialData, recipient, publicKey);
		} else {
			let password = recipient;
			let isEmbeddedContentInfo = publicKey;

			encryptedDataPromise = Crypto.encryptWithPasswordAsync(initialData, password, isEmbeddedContentInfo);
		}

		return encryptedDataPromise;
	}

	/**
	 * Decrypt data using private key
	 *
	 * @param initialEncryptedData {string} - base64 String!
	 * @param recipientId {string}
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword] {string}
	 * @returns {string} - base64 String!
	 */
	static decryptWithKey (initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword = '') {
		if (!_.isString(initialEncryptedData)) {
			throwValidationError('00001', { arg: 'initialEncryptedData', type: 'base64 String' });
		}

		if (!_.isString(recipientId)) {
			throwValidationError('00001', { arg: 'recipientId', type: 'String' });
		}

		if (!_.isString(privateKeyBase64)) {
			throwValidationError('00001', { arg: 'privateKeyBase64', type: 'base64 String' });
		}

		let virgilCipher = new Crypto.VirgilCipher();
		let decryptedDataBase64;

		try {
			let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipientId);
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialEncryptedData);
			let privateKeyByteArray = Crypto.VirgilByteArrayFromBase64(privateKeyBase64);
			let privateKeyPasswordByteArray = Crypto.VirgilByteArrayFromUTF8(privateKeyPassword);
			let decryptedDataByteArray = virgilCipher.decryptWithKey(dataByteArray, recipientIdByteArray, privateKeyByteArray, privateKeyPasswordByteArray);
			decryptedDataBase64 = Crypto.VirgilByteArrayToBase64(decryptedDataByteArray);

			// cleanup memory to avoid memory leaks
			recipientIdByteArray.delete();
			dataByteArray.delete();
			privateKeyByteArray.delete();
			decryptedDataByteArray.delete();
			privateKeyPasswordByteArray.delete();
		} catch (e) {
			throwVirgilError('90002', { initialData: initialEncryptedData, key: privateKeyBase64 });
		} finally {
			virgilCipher.delete();
		}

		return decryptedDataBase64;
	}

	/**
	 * Decrypt data using private key and using workers
	 *
	 * @param initialEncryptedData {string} - base64 String!
	 * @param recipientId {string}
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword] {string}
	 * @returns {Promise}
	 */
	static decryptWithKeyAsync (initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.decryptWithKey(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._decryptWithKeyAsync(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword);
		}
	}

	/**
	 * Decrypt data using private key and using workers
	 *
	 * @param initialEncryptedData {Buffer}
	 * @param recipientId {string}
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword] {string}
	 * @returns {Promise}
	 * @private
	 */
	static _decryptWithKeyAsync (initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword = '') {
		if (!_.isString(recipientId)) {
			throwValidationError('00001', { arg: 'recipientId', type: 'String' });
		}

		if (!_.isString(privateKeyBase64)) {
			throwValidationError('00001', { arg: 'privateKeyBase64', type: 'base64 String' });
		}

		let worker = createWorkerCryptoFunc(function(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword) {
			console.log(bufferToByteArray);
			debugger;
			//let deferred = this.deferred();
			//let Crypto = this.Crypto;
			//let virgilCipher = new Crypto.VirgilCipher();
			//
			//try {
			//	let recipientIdByteArray = Crypto.VirgilByteArrayFromUTF8(recipientId);
			//	let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialEncryptedData);
			//	let privateKeyByteArray = Crypto.VirgilByteArrayFromBase64(privateKeyBase64);
			//	let privateKeyPasswordByteArray = Crypto.VirgilByteArrayFromUTF8(privateKeyPassword);
			//	let decryptedDataByteArray = virgilCipher.decryptWithKey(dataByteArray, recipientIdByteArray, privateKeyByteArray, privateKeyPasswordByteArray);
			//	let decryptedDataBase64 = Crypto.VirgilByteArrayToBase64(decryptedDataByteArray);
			//
			//	// cleanup memory to avoid memory leaks
			//	recipientIdByteArray.delete();
			//	dataByteArray.delete();
			//	privateKeyByteArray.delete();
			//	decryptedDataByteArray.delete();
			//	privateKeyPasswordByteArray.delete();
			//
			//	deferred.resolve(decryptedDataBase64);
			//} catch (e) {
			//	deferred.reject(e);
			//} finally {
			//	virgilCipher.delete();
			//}
		});

		return worker(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword).catch(() => {
			return getErrorMessage(['crypto', '90002'], { initialData: initialEncryptedData, key: privateKeyBase64 });
		});
	}

	/**
	 * Decrypt data using password
	 *
	 * @param initialEncryptedData {string}
	 * @param [password = ''] {string}
	 * @returns {string} - base64 String!
	 */
	static decryptWithPassword (initialEncryptedData, password = '') {
		let virgilCipher = new Crypto.VirgilCipher();
		let decryptedDataBuffer;

		try {
			let dataByteArray = toByteArray(initialEncryptedData);
			let passwordByteArray = toByteArray(password);
			let decryptedDataByteArray = virgilCipher.decryptWithPassword(dataByteArray, passwordByteArray);
			decryptedDataBuffer = byteArrayToBuffer(decryptedDataByteArray);

			// cleanup memory to avoid memory leaks
			dataByteArray.delete();
			passwordByteArray.delete();
			decryptedDataByteArray.delete();
		} catch (e) {
			throwVirgilError('90004', { initialData: initialEncryptedData, password: password });
		} finally {
			virgilCipher.delete();
		}

		return decryptedDataBuffer;
	}

	/**
	 * Decrypt data using password and using workers
	 *
	 * @param initialEncryptedData {string}
	 * @param [password = ''] {string}
	 * @returns {Promise}
	 */
	static decryptWithPasswordAsync (initialEncryptedData, password) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.decryptWithPassword(initialEncryptedData, password));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			// convert to base64 to support base64 based interface and avoid redundant blobs in workers
			return Crypto._decryptWithPasswordAsync(toBase64(initialEncryptedData), password).then((result) => {
				// convert the base64 response to Buffer for support new interface
				return base64ToBuffer(result);
			});
		}
	}

	/**
	 * Decrypt data using password and using workers
	 *
	 * @param initialEncryptedData {string}
	 * @param [password = ''] {string}
	 * @returns {Promise}
	 * @private
	 */
	static _decryptWithPasswordAsync (initialEncryptedData, password = '') {
		let worker = createWorkerCryptoFunc(function(initialEncryptedData, password) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilCipher = new Crypto.VirgilCipher();

			try {
				let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialEncryptedData);
				let passwordByteArray = Crypto.VirgilByteArrayFromUTF8(password);
				let decryptedDataByteArray = virgilCipher.decryptWithPassword(dataByteArray, passwordByteArray);
				let decryptedData = Crypto.VirgilByteArrayToBase64(decryptedDataByteArray);

				// cleanup memory to avoid memory leaks
				dataByteArray.delete();
				passwordByteArray.delete();
				decryptedDataByteArray.delete();

				deferred.resolve(decryptedData);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilCipher.delete();
			}
		});

		return worker(initialEncryptedData, password).catch(() => {
			return getErrorMessage(['crypto', '90004'], { initialData: initialEncryptedData, password: password });
		});
	}

	/**
	 * Decrypt data
	 *
	 * @param initialEncryptedData {string} - base64 String!
	 * @param recipientId {string}
	 * @param [privateKeyBase64] {string} - base64 String!
	 * @param [privateKeyPassword] {string}
	 * @returns {string} - base64 String!
	 */
	static decrypt (initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword) {
		let decryptedData;

		if (arguments.length === 2) {
			let password = recipientId;

			decryptedData = Crypto.decryptWithPassword(initialEncryptedData, password)
		} else {
			decryptedData = Crypto.decryptWithKey(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword)
		}

		return decryptedData;
	}

	/**
	 * Decrypt data async
	 *
	 * @param initialEncryptedData {string} - base64 String!
	 * @param recipientId {string}
	 * @param [privateKeyBase64] {string} - base64 String!
	 * @param [privateKeyPassword] {string}
	 * @returns {Promise}
	 */
	static decryptAsync (initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword) {
		let decryptedDataPromise;

		if (arguments.length === 2) {
			let password = recipientId;

			decryptedDataPromise = Crypto.decryptWithPasswordAsync(initialEncryptedData, password)
		} else {
			decryptedDataPromise = Crypto.decryptWithKeyAsync(initialEncryptedData, recipientId, privateKeyBase64, privateKeyPassword)
		}

		return decryptedDataPromise;
	}

	/**
	 * Sign the encrypted data using private key
	 *
	 * @param initialData {string} - base64 String!
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword = ''] {string}
	 * @returns {string} - base64 String!
	 */
	static sign (initialData, privateKeyBase64, privateKeyPassword = '') {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'base64 String' });
		}

		if (!_.isString(privateKeyBase64)) {
			throwValidationError('00001', { arg: 'privateKeyBase64', type: 'String' });
		}

		let virgilSigner = new Crypto.VirgilSigner();
		let signBase64;

		try {
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
			let privateKeyByteArray = Crypto.VirgilByteArrayFromBase64(privateKeyBase64);
			let privateKeyPasswordByteArray = Crypto.VirgilByteArrayFromUTF8(privateKeyPassword);

			let sign = virgilSigner.sign(dataByteArray, privateKeyByteArray, privateKeyPasswordByteArray);
			signBase64 = Crypto.VirgilByteArrayToBase64(sign);

			// cleanup memory to avoid memory leaks
			dataByteArray.delete();
			privateKeyByteArray.delete();
			privateKeyPasswordByteArray.delete();
		} catch (e) {
			throwVirgilError('90005', { initialData: initialData, key: privateKeyBase64, password: privateKeyPassword });
		} finally {
			virgilSigner.delete();
		}

		return signBase64;
	}

	/**
	 * Sign the encrypted data using private key using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword = ''] {string}
	 * @returns {Promise}
	 */
	static signAsync (initialData, privateKeyBase64, privateKeyPassword) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.sign(initialData, privateKeyBase64, privateKeyPassword));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._signAsync(initialData, privateKeyBase64, privateKeyPassword);
		}
	}

	/**
	 * Sign the encrypted data using private key using workers
	 *
	 * @param initialData {string} - base64 String!
	 * @param privateKeyBase64 {string} - base64 String!
	 * @param [privateKeyPassword = ''] {string}
	 * @returns {Promise}
	 * @private
	 */
	static _signAsync (initialData, privateKeyBase64, privateKeyPassword = '') {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'base64 String' });
		}

		if (!_.isString(privateKeyBase64)) {
			throwValidationError('00001', { arg: 'privateKeyBase64', type: 'String' });
		}

		let worker = createWorkerCryptoFunc(function(initialData, privateKeyBase64, privateKeyPassword) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilSigner = new Crypto.VirgilSigner();

			try {
				let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
				let privateKeyByteArray = Crypto.VirgilByteArrayFromBase64(privateKeyBase64);
				let privateKeyPasswordByteArray = Crypto.VirgilByteArrayFromUTF8(privateKeyPassword);

				let sign = virgilSigner.sign(dataByteArray, privateKeyByteArray, privateKeyPasswordByteArray);
				let signBase64 = Crypto.VirgilByteArrayToBase64(sign);

				// cleanup memory to avoid memory leaks
				dataByteArray.delete();
				privateKeyByteArray.delete();
				privateKeyPasswordByteArray.delete();

				deferred.resolve(signBase64);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilSigner.delete();
			}
		});

		return worker(initialData, privateKeyBase64, privateKeyPassword).catch(() => {
			return getErrorMessage(['crypto', '90005'], { initialData: initialData, key: privateKeyBase64, password: privateKeyPassword });
		});
	}

	/**
	 * Verify signed data using public key
	 *
	 * @param initialData {string}
	 * @param publicKey {string}
	 * @param sign {string} - base64 String!
	 * @returns {boolean}
	 */
	static verify (initialData, publicKey, sign) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'base64 String' });
		}

		if (!_.isString(publicKey)) {
			throwValidationError('00001', { arg: 'publicKey', type: 'String' });
		}

		if (!_.isString(sign)) {
			throwValidationError('00001', { arg: 'sign', type: 'base64 String' });
		}

		let virgilSigner = new Crypto.VirgilSigner();
		let isVerified;

		try {
			let signByteArray = Crypto.VirgilByteArrayFromBase64(sign);
			let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
			let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(publicKey);
			isVerified = virgilSigner.verify(dataByteArray, signByteArray, publicKeyByteArray);

			// cleanup memory to avoid memory leaks
			dataByteArray.delete();
			publicKeyByteArray.delete();
			signByteArray.delete();
		} catch (e) {
			throwVirgilError('90006', { initialData: initialData, key: publicKey, sign: sign });
		} finally {
			virgilSigner.delete();
		}

		return isVerified;
	}

	/**
	 * Verify signed data using public key using workers
	 *
	 * @param initialData {string}
	 * @param publicKey {string}
	 * @param sign {string} - base64 String!
	 * @returns {Promise}
	 */
	static verifyAsync (initialData, publicKey, sign) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.verify(initialData, publicKey, sign));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._verifyAsync(initialData, publicKey, sign);
		}
	}

	/**
	 * Verify signed data using public key using workers
	 *
	 * @param initialData {string}
	 * @param publicKey {string}
	 * @param sign {string} - base64 String!
	 * @returns {Promise}
	 * @private
	 */
	static _verifyAsync (initialData, publicKey, sign) {
		if (!_.isString(initialData)) {
			throwValidationError('00001', { arg: 'initialData', type: 'base64 String' });
		}

		if (!_.isString(publicKey)) {
			throwValidationError('00001', { arg: 'publicKey', type: 'String' });
		}

		if (!_.isString(sign)) {
			throwValidationError('00001', { arg: 'sign', type: 'base64 String' });
		}

		let worker = createWorkerCryptoFunc(function(initialData, publicKey, sign) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;
			let virgilSigner = new Crypto.VirgilSigner();

			try {
				let signByteArray = Crypto.VirgilByteArrayFromBase64(sign);
				let dataByteArray = Crypto.VirgilByteArrayFromBase64(initialData);
				let publicKeyByteArray = Crypto.VirgilByteArrayFromUTF8(publicKey);
				let isVerified = virgilSigner.verify(dataByteArray, signByteArray, publicKeyByteArray);

				// cleanup memory to avoid memory leaks
				dataByteArray.delete();
				publicKeyByteArray.delete();
				signByteArray.delete();

				deferred.resolve(isVerified);
			} catch (e) {
				deferred.reject(e);
			} finally {
				virgilSigner.delete();
			}
		});

		return worker(initialData, publicKey, sign).catch(() => {
			return getErrorMessage(['crypto', '90006'], { initialData: initialData, key: publicKey, sign: sign });
		});
	}

	/**
	 * Generate the key pair - public and private keys
	 *
	 * @param [password = ''] {string}
	 * @param [keysType = 'ecBrainpool512'] {string}
	 * @returns {{publicKey: *, privateKey: *}}
	 */
	static generateKeys (password = '', keysType = KeysTypesEnum.ecBrainpool512) {
		password = !!password ? password : '';
		keysType = KeysTypesEnum(keysType);

		if (_.isUndefined(keysType)) {
			throwValidationError('00002', { arg: 'keysType', type: `equal to one of ${_.values(KeysTypesEnum).join(', ')} - use the KeysTypesEnum for it.` });
		}

		let virgilKeys;
		let publicKey;
		let privateKey;

		try {
			let passwordByteArray = Crypto.VirgilByteArrayFromUTF8(password);
			virgilKeys = Crypto.VirgilKeyPair[keysType](passwordByteArray);

			publicKey = virgilKeys.publicKey().toUTF8();
			privateKey = virgilKeys.privateKey().toUTF8(virgilKeys);

			// cleanup memory to avoid memory leaks
			passwordByteArray.delete();
			virgilKeys.delete();
		} catch (e) {
			throwVirgilError('90007', { password: password });
		}

		return {
			publicKey: publicKey,
			privateKey: privateKey
		};
	}

	/**
	 * Generate the key pair - public and private keys
	 *
	 * @param [password = ''] {string}
	 * @param [keysType = 'ecBrainpool512'] {string}
	 * @returns {{publicKey: *, privateKey: *}}
	 */
	static generateKeyPair (password, keysType) {
		return Crypto.generateKeys(password, keysType);
	}

	/**
	 * Generate the key pair - public and private keys using workers
	 *
	 * @param [password = ''] {String}
	 * @param [keysType = 'ecBrainpool512'] {string}
	 * @returns {Promise}
	 */
	static generateKeysAsync (password, keysType) {
		if (isIE()) {
			return new Promise((resolve, reject) => {
				try {
					resolve(Crypto.generateKeys(password, keysType));
				} catch (e) {
					reject(e.message);
				}
			});
		} else {
			return Crypto._generateKeysAsync(password, keysType);
		}
	}

	/**
	 * Generate the key pair - public and private keys using workers
	 *
	 * @param [password = ''] {String}
	 * @param [keysType = 'ecBrainpool512'] {string}
	 * @returns {Promise}
	 */
	static generateKeyPairAsync (password, keysType) {
		return Crypto.generateKeysAsync(password, keysType);
	}

	/**
	 * Generate the key pair - public and private keys using workers
	 *
	 * @param [password = ''] {String}
	 * @param [keysType = 'ecBrainpool512'] {string}
	 * @returns {Promise}
	 * @private
	 */
	static _generateKeysAsync (password = '', keysType = KeysTypesEnum.ecBrainpool512) {
		password = !!password ? password : '';
		keysType = KeysTypesEnum(keysType);

		if (_.isUndefined(keysType)) {
			throwValidationError('00002', { arg: 'keysType', type: `equal to one of ${_.values(KeysTypesEnum).join(', ')} - use the KeysTypesEnum for it.` });
		}

		let worker = createWorkerCryptoFunc(function(password, keysType) {
			let deferred = this.deferred();
			let Crypto = this.Crypto;

			try {
				let passwordByteArray = Crypto.VirgilByteArrayFromUTF8(password);
				let virgilKeys = Crypto.VirgilKeyPair[keysType](passwordByteArray);

				let publicKey = virgilKeys.publicKey().toUTF8();
				let privateKey = virgilKeys.privateKey().toUTF8(virgilKeys);

				// cleanup memory to avoid memory leaks
				passwordByteArray.delete();
				virgilKeys.delete();

				deferred.resolve({ publicKey: publicKey, privateKey: privateKey });
			} catch (e) {
				deferred.reject(e);
			}
		});

		return worker(password, keysType).catch(() => {
			return getErrorMessage(['crypto', '90007'], { password: password });
		});
	}

}

export default Crypto;
