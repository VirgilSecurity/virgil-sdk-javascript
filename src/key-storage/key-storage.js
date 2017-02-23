/**
 * Interface for classes that represent a storage container for cryptographic
 * keys.
 *
 * @interface KeyStorage
 */

/**
 * Persists the private key material under a name.
 *
 * @function
 * @name KeyStorage#store
 * @param {string} name - Name of key.
 * @param {Buffer} privateKeyData - The key material to store.
 *
 * @returns {Promise} - A Promise that will be resolved when the key
 * has been persisted.
 * */

/**
 * Gets the private key stored under name.
 *
 * @function
 * @name KeyStorage#load
 * @param {string} name Name of key.
 *
 * @returns {Promise.<Buffer>} Promise that will be resolved
 * with the stored key material.
 * */

/**
 * Checks whether a key with the given name exists in persistent storage.
 *
 * @function
 * @name KeyStorage#exists
 * @param {string} name - Name of the key to check.
 *
 * @returns {Promise.<Boolean>} Promise that will be resolved with True if
 * 		the key exists and False otherwise.
 */

/**
 * Removes the private key stored under name from persistent storage.
 *
 * @function
 * @name KeyStorage#delete
 * @param {string} name Name of key to remove.
 *
 * @returns {Promise} - A Promise that will be resolved when the key
 * has been removed.
 * */
