/**
 * Interface for classes that represent a cryptographic keys storage
 * containers.
 *
 * @interface KeyStorage
 */

/**
 * Persists the private key material under a name.
 *
 * @function
 * @name KeyStorage#save
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
 * @return {Promise.<Buffer>} Promise that will be resolved
 * with the stored key material.
 * */

/**
 * Removes the private key stored under name from persistent storage.
 *
 * @function
 * @name KeyStorage#remove
 * @param {string} name Name of key to remove.
 *
 * @returns {Promise} - A Promise that will be resolved when the key
 * has been removed.
 * */


module.exports = require('./file-storage');
