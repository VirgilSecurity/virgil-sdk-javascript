/**
 * Calculates the snapshot of the `content`.
 *
 * @hidden
 *
 * @param {object} content - The content object.
 * @returns {Buffer} - The snapshot.
 */
export function takeSnapshot (content: object): Buffer {
	return Buffer.from( JSON.stringify(content), 'utf8' );
}

/**
 * Constructs the original object out of the `snapshot`.
 *
 * @hidden
 *
 * @param {Buffer} snapshot - The snapshot.
 * @returns {T} - The object.
 */
export function parseSnapshot<T> (snapshot: Buffer): T {
	return JSON.parse( snapshot.toString('utf8') ) as T;
}
