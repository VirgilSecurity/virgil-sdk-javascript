/**
 * Interface for classes that represent a persistent storage backend adapters.
 *
 * @interface StorageAdapter
 */

/**
 * Persists the value under the name.
 *
 * @function
 * @name StorageAdapter#save
 * @param {string} name
 * @param {*} value
 *
 * @returns {Promise} - A Promise that will be resolved when the value
 * has been persisted.
 * */

/**
 * Gets the value stored under name.
 *
 * @function
 * @name StorageAdapter#load
 * @param {string} name
 *
 * @returns {Promise.<*>} Promise that will be resolved
 * with the stored value.
 * */

/**
 * Checks whether a there is a value for the given key in store.
 *
 * @function
 * @name StorageAdapter#exists
 * @param {string} key
 *
 * @returns {Promise.<Boolean>}
 */

/**
 * Removes the value stored under name from persistent storage.
 *
 * @function
 * @name StorageAdapter#remove
 * @param {string} name
 *
 * @returns {Promise} - A Promise that will be resolved when the value
 * has been removed.
 * */
