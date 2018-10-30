// Some code originally from localForage
// See: https://github.com/localForage/localForage/blob/master/src/utils/isIndexedDBValid.js
/**
 * @hidden
 * @returns {boolean}
 */
export function isIndexedDbValid() {
	// We mimic PouchDB here
	// Following #7085 (see https://github.com/pouchdb/pouchdb/issues/7085)
	// buggy idb versions (typically Safari < 10.1) are considered valid.

	// On Firefox SecurityError is thrown while referencing indexedDB if cookies
	// are not allowed. `typeof indexedDB` also triggers the error.
	try {
		// some outdated implementations of IDB that appear on Samsung
		// and HTC Android devices <4.4 are missing IDBKeyRange
		return typeof indexedDB !== 'undefined' && typeof IDBKeyRange !== 'undefined';
	} catch (e) {
		return false;
	}
}
