/**
 * Interface for classes that represent a cryptographic keys storage
 * containers.
 *
 * @interface KeyStorage
 */

/**
 * Persists the private key encrypted with password under a name.
 *
 * @function
 * @name KeyStorage#store
 * @param {string} name - Name of key.
 * @param {CryptoKeyHandle} privateKey - Key to store.
 * @param {string} password - Password to use for encryption.
 *
 * @returns {Promise} - A Promise that will be resolved when the key
 * has been persisted.
 * */

/**
 * Gets the private key stored under name decrypting it using the
 * password.
 *
 * @function
 * @name KeyStorage#load
 * @param {string} name Name of key.
 * @param {string} password Password to use for decryption.
 *
 * @return {Promise.<CryptoKeyHandle>} Promise that will be resolved
 * with the stored key.
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
