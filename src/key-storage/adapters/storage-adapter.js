/**
 * Interface for classes that represent a persistent storage backend.
 *
 * @interface StorageAdapter
 */

/**
 * Store a value under the key.
 *
 * @function
 * @name StorageAdapter#save
 * @param {string} key - The key under which the value is stored.
 * @param {*} value - The value to store.
 *
 * @returns {Promise} - A Promise that will be resolved when the value
 * has been persisted.
 * */

/**
 * Load the value stored under the key.
 *
 * @function
 * @name StorageAdapter#load
 * @param {string} key - The key to retrieve.
 *
 * @return {Promise.<*>} Promise that will be resolved
 * with the stored value.
 * */

/**
 * Remove the value stored under key from persistent storage.
 *
 * @function
 * @name StorageAdapter#remove
 * @param {string} key - The key to remove.
 *
 * @returns {Promise} - A Promise that will be resolved when the value
 * has been removed.
 * */
