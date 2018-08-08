// This code is borrowed from localForage
// See: https://github.com/localForage/localForage/blob/master/src/utils/idb.js
/**
 * @hidden
 */
function getIdb() {
	/* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
	try {
		if (typeof indexedDB !== 'undefined') {
			return indexedDB;
		}
		if (typeof webkitIndexedDB !== 'undefined') {
			return webkitIndexedDB;
		}
		if (typeof mozIndexedDB !== 'undefined') {
			return mozIndexedDB;
		}
		if (typeof OIndexedDB !== 'undefined') {
			return OIndexedDB;
		}
		if (typeof msIndexedDB !== 'undefined') {
			return msIndexedDB;
		}
	} catch (e) {
		return;
	}
}

/**
 * @hidden
 */
export const idb = getIdb();
