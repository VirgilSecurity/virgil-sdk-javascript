import { encode, decode } from 'base-64';

/**
 * Decodes the base64 encoded string into a `string`.
 * @hidden
 * @param {string} input
 * @returns {string}
 */
export function base64Decode(input: string): string {
	return decode(input);
}

/**
 * Encodes the `input` string into a base64 `string`.
 * @hidden
 * @param {string} input
 * @returns {string}
 */
export function base64Encode(input: string): string {
	return encode(input);
}

/**
 * Converts regular base64 encoded string to URL-safe base64 encoded string.
 * @hidden
 * @param {string} input - Regular base64 encoded string.
 * @returns {string} - URL-safe base64 encoded string.
 */
export function base64UrlFromBase64 (input: string) {
	input = input.split('=')[0];
	input = input.replace(/\+/g, '-').replace(/\//g, '_');
	return input;
}

/**
 * Converts URL-safe base64 encoded string to regular base64 encoded string.
 * @hidden
 * @param {string} input - URL-safe base64 encoded string.
 * @returns {string} - Regular base64 encoded string.
 */
export function base64UrlToBase64 (input: string) {
	input = input.replace(/-/g, '+').replace(/_/g, '/');
	switch (input.length % 4) {
		case 0: break; // no padding needed
		case 2:
			input = input + '==';
			break;
		case 3:
			input = input + '=';
			break;
		default:
			throw new Error('Invalid base64 string');
	}
	return input;
}

/**
 * * Encodes the `input` string into a string using URL-safe base64 encoding.
 *
 * @hidden
 *
 * @param {string} input - The input.
 * @returns {string}
 */
export function base64UrlEncode (input: string) {
	let output = base64Encode(input);
	return base64UrlFromBase64(output);
}


/**
 * Decodes the URL-safe base64-encoded `input` string into a `string`.
 *
 * @hidden
 *
 * @param {string} input
 * @returns {string}
 */
export function base64UrlDecode (input: string): string {
	return base64Decode(input);
}
