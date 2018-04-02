const BASE_64 = 'base64';

export function base64Encode (input: string|Buffer, inputEncoding?: string) {
	let buffer: Buffer;

	if (input instanceof Buffer) {
		buffer = input;
	} else if (inputEncoding && Buffer.isEncoding(inputEncoding)) {
		buffer = new Buffer(input, inputEncoding)
	} else {
		buffer = new Buffer(input);
	}

	return buffer.toString(BASE_64);
}

export function base64Decode (input: string): Buffer {
	return new Buffer(input, BASE_64);
}