/**
 * Calculates the snapshot of the `content`.
 *
 * @hidden
 *
 * @param {object} content - The content object.
 * @returns {string} - The snapshot.
 */
export function takeSnapshot (content: object): string {
	return JSON.stringify(content);
}

/**
 * Constructs the original object out of the `snapshot`.
 *
 * @hidden
 *
 * @param {string} snapshot - The snapshot.
 * @returns {T} - The object.
 */
export function parseSnapshot<T> (snapshot: string): T {
	return JSON.parse( snapshot ) as T;
}
