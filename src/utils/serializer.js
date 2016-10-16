export function serializeSignatures(signatures) {
	return Object.keys(signatures)
		.reduce((result, signerId) => {
			result[signerId] = signatures[signerId].toString('base64');
			return result;
		}, {});
}

export function deserializeSignatures (signatures) {
	return Object.keys(signatures)
		.reduce((result, signerId) => {
			result[signerId] = new Buffer(signatures[signerId], 'base64');
			return result;
		}, {});
}

export function serializePublicKey(publicKey) {
	return publicKey.toString('base64');
}

export function deserializePublicKey (publicKey) {
	return new Buffer(publicKey, 'base64');
}

export function serializeContentSnapshot(snapshot) {
	return snapshot.toString('base64');
}

export function deserializeContentSnapshot (snapshot) {
	return new Buffer(snapshot, 'base64');
}
