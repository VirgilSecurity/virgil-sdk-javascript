const BASE_64 = 'base64';

export function base64UrlEncode (input: string|Buffer, inputEncoding?: string) {
	let output = base64Encode(input, inputEncoding);
	output = output.split('=')[0];
	output = output.replace('+', '-').replace('/', '_');
	return output;
}

export function base64UrlDecode (input: string): Buffer {
	input = input.replace('-', '+').replace('_', '/');
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

export function base64Decode(input: string): Buffer {
	return Buffer.from(input, BASE_64);
}

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
