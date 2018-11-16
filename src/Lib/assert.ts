/**
 * Test if `condition` is truthy. If it is not, an `Error` is thrown with a
 * `message` property equal to `message` parameter.
 * @hidden
 * @param {boolean} condition
 * @param {string} message
 */
export function assert(condition: boolean, message: string) {
	if (!condition) {
		throw new Error(message);
	}
}
