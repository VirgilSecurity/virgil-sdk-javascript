const BASE_64 = 'base64';

export function base64Decode(input: string): Buffer;
export function base64Decode(input: string, outputEncoding: string): string;

/**
 * Decodes the base64 encoded string into a `Buffer` or `string` depending on
 * the presence of `outputEncoding` parameter.
 * @hidden
 * @param {string} input
 * @param {string} [outputEncoding] - If provided, specifies the output string
 * encoding.
 * @returns {Buffer|string}
 */
export function base64Decode(input: string, outputEncoding?: string): Buffer|string {
	if (outputEncoding) {
		return Buffer.from(input, BASE_64).toString(outputEncoding);
	}
	return Buffer.from(input, BASE_64);
}

/**
 * Encodes the `input` bytes into a string using base64 encoding.
 * If `input` is a string, it is first converted to byte array by decoding
 * it using `inputEncoding`.
 * @hidden
 * @param {Buffer | string} input
 * @param {string} inputEncoding
 * @returns {string}
 */
export function base64Encode(input: Buffer|string, inputEncoding?: string): string {
	let buffer: Buffer;

	if (Buffer.isBuffer(input)) {
		buffer = input;
	} else if (inputEncoding && Buffer.isEncoding(inputEncoding)) {
		buffer = Buffer.from(input, inputEncoding)
	} else {
		buffer = Buffer.from(input);
	}

	return buffer.toString(BASE_64);
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
 * * Encodes the `input` bytes into a string using URL-safe base64 encoding.
 * If `input` is a string, it is first converted to byte array by decoding
 * it using `inputEncoding`.
 *
 * @hidden
 *
 * @param {string | Buffer} input - The input.
 * @param {string} inputEncoding - If `input` is a string, this parameter
 * specifies the encoding of the input string. If `input` is a `Buffer`, this
 * parameter is ignored.
 * @returns {string}
 */
export function base64UrlEncode (input: string|Buffer, inputEncoding?: string) {
	let output = base64Encode(input, inputEncoding);
	return base64UrlFromBase64(output);
}

export function base64UrlDecode (input: string): Buffer;
export function base64UrlDecode (input: string, outputEncoding: string): string;

/**
 * Decodes the URL-safe base64-encoded `input` string into a `Buffer` or
 * `string` depending on the presence of `outputEncoding` parameter.
 *
 * @hidden
 *
 * @param {string} input
 * @param {string} [outputEncoding] - If provided, specifies the output string
 * encoding.
 * @returns {Buffer|string}
 */
export function base64UrlDecode (input: string, outputEncoding?: string): Buffer|string {
	input = base64UrlToBase64(input);
	if (outputEncoding) {
		return base64Decode(input, outputEncoding);
	}

	return base64Decode(input);
}
