function serializeSignatures(signatures) {
	return Object.keys(signatures)
		.reduce(function (result, signerId) {
			result[signerId] = signatures[signerId].toString('base64');
			return result;
		}, {});
}

function deserializeSignatures (signatures) {
	return Object.keys(signatures)
		.reduce(function (result, signerId) {
			result[signerId] = new Buffer(signatures[signerId], 'base64');
			return result;
		}, {});
}

function serializePublicKey(publicKey) {
	return publicKey.toString('base64');
}

function deserializePublicKey (publicKey) {
	return new Buffer(publicKey, 'base64');
}

function serializeContentSnapshot(snapshot) {
	return snapshot.toString('base64');
}

function deserializeContentSnapshot (snapshot) {
	return new Buffer(snapshot, 'base64');
}

module.exports = {
	serializeSignatures: serializeSignatures,
	deserializeSignatures: deserializeSignatures,
	serializePublicKey: serializePublicKey,
	deserializePublicKey: deserializePublicKey,
	serializeContentSnapshot: serializeContentSnapshot,
	deserializeContentSnapshot: deserializeContentSnapshot
};
