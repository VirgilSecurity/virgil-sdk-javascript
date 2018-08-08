const BASE_64 = 'base64';

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
	output = output.split('=')[0];
	output = output.replace(/\+/g, '-').replace(/\//g, '_');
	return output;
}

/**
 * Decodes the URL-safe base64-encoded `input` string into a `Buffer`.
 *
 * @hidden
 *
 * @param {string} input
 * @returns {Buffer}
 */
export function base64UrlDecode (input: string): Buffer {
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

	return base64Decode(input);
}

/**
 * Decodes the base64 encoded string into a `Buffer`.
 * @hidden
 * @param {string} input
 * @returns {Buffer}
 */
export function base64Decode(input: string): Buffer {
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
export function base64Encode(input: Buffer|string, inputEncoding?: string) {
	let buffer: Buffer;

	if (Buffer.isBuffer(input)) {
		buffer = input;
	} else if (inputEncoding && Buffer.isEncoding(inputEncoding)) {
		buffer = new Buffer(input, inputEncoding)
	} else {
		buffer = new Buffer(input);
	}

	return buffer.toString(BASE_64);
}
