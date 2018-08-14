/**
 * {@link FileSystemStorageAdapter} or {@link IndexedDbStorageAdapter}
 * depending on the target platform (node or browser).
 */
export { default as DefaultStorageAdapter } from './FileSystemStorageAdapter';
