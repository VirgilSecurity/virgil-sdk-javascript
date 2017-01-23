var test = require('tape');

var CardScope = require('../../src/client/card-scope');
var createSignableRequest = require('../../src/client/signable-request').createSignableRequest;
var importSignableRequest = require('../../src/client/signable-request').importSignableRequest;

function setup() {
	var pubkey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHYk1CUUdCeXFHU000' +
		'OUFnRUdDU3NrQXdNQ0NBRUJEUU9CZ2dBRUNhV3k5VVVVMDFWcjdQLzExWHpubk0vR' +
		'AowTi9KODhnY0dMV3pYMGFLaGcxSjdib3B6RGV4b0QwaVl3alFXVUpWcVpJQjRLdF' +
		'VneG9IcS81c2lybUI2cW1OClNFODNxcTZmbitPSm9qeUpGMytKY1AwTUp1WXRVZnp' +
		'HbjgvUHlHVkp1TEVHais0NTlKWTRWbzdKb1pnS2hBT24KcWJ3UjRlcTY0citlUEpN' +
		'cUppMD0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t';

	var parameters = {
		identity: 'user123',
		identity_type: 'username',
		scope: CardScope.APPLICATION,
		public_key: pubkey,
		data: {
			custom_key_1: 'custom_value_1',
			custom_key_2: 'custom_value_2'
		},
		info: {
			device: 'Google Chrome 55 on Windows 10'
		}
	};

	var request = createSignableRequest(parameters);

	return {
		parameters: parameters,
		request: request
	};
}

test('create signable request', function (t) {
	var fixture = setup();

	var parameters = fixture.parameters;
	var request = fixture.request;

	t.ok(request, 'Request created.');

	t.equal(request.identity, parameters.identity,
		'Identity is set');
	t.equal(request.identity_type, parameters.identity_type,
		'Identity type is set');
	t.equal(request.scope, parameters.scope, 'Scope is set');
	t.equal(request.public_key, parameters.public_key, 'Public key is set');
	t.deepEqual(request.data, parameters.data, 'Data is set');
	t.deepEqual(request.info, parameters.info, 'Info is set');

	t.end();
});

test('get singable request snapshot', function (t) {
	var fixture = setup();

	var expectedParameters = fixture.parameters;
	var request = fixture.request;

	var snapshot = request.getSnapshot();
	t.ok(Buffer.isBuffer(snapshot), 'Snapshot should be a Buffer');

	var actualParameters;
	try {
		actualParameters = JSON.parse(snapshot.toString());
	} catch (err) {
		t.fail('Could not parse snapshot. ' + err.message);
	}

	t.deepEqual(actualParameters, expectedParameters,
		'Expected and actual parameters match.');
	t.end();
});

test('sign request and get signature', function (t) {
	var fixture = setup();

	var request = fixture.request;

	var expectedSignerId = 'bb5db5084dab5';
	var expectedSignature = new Buffer(
		'MIGaMA0GCWCGSAFlAwQCAgUABIGIMIGF', 'base64');

	request.appendSignature(expectedSignerId, expectedSignature);

	t.ok(request.getSignature(expectedSignerId).equals(expectedSignature),
		'Returns signature for exiting signer id.');
	t.equal(request.getSignature('gibberish'), null,
		'Returns null for non-existing signer id.');
	t.end();
});

test('get signable request body', function (t) {
	var fixture = setup();

	var request = fixture.request;

	var expectedSnapshot = request.getSnapshot();
	var expectedSignerId = 'bb5db5084dab5';
	var expectedSignature = new Buffer(
		'MIGaMA0GCWCGSAFlAwQCAgUABIGIMIGF', 'base64');
	var expectedBody = {
		content_snapshot: expectedSnapshot.toString('base64'),
		meta: { signs: { } }
	};
	expectedBody.meta.signs[expectedSignerId] =
		expectedSignature.toString('base64');

	request.appendSignature(expectedSignerId, expectedSignature);

	var requestBody = request.getRequestBody();
	t.deepEqual(requestBody, expectedBody, 'Returns response body correctly');
	t.end();

});

test('export signable request', function (t) {
	var fixture = setup();

	var request = fixture.request;
	var expectedBody = request.getRequestBody();

	var exportedRequest = request.export();
	var actualBody;
	try {
		actualBody = JSON.parse(new Buffer(exportedRequest, 'base64')
			.toString('utf8'));
	} catch (err) {
		t.fail('Could not parse exported request. ' + err.message);
	}

	t.deepEqual(actualBody, expectedBody, 'Exports request correctly');
	t.end();
});

test('import signable request', function (t) {
	var fixture = setup();

	var parameters = fixture.parameters;
	var request = fixture.request;

	var expectedSignerId = 'bb5db5084dab5';
	var expectedSignature = new Buffer(
		'MIGaMA0GCWCGSAFlAwQCAgUABIGIMIGF', 'base64');

	request.appendSignature(expectedSignerId, expectedSignature);

	var importedRequest = importSignableRequest(request.export());
	t.ok(importedRequest, 'Signable request imported.');

	t.equal(importedRequest.identity, parameters.identity,
		'Identity is set');
	t.equal(importedRequest.identity_type, parameters.identity_type,
		'Identity type is set');
	t.equal(importedRequest.scope, parameters.scope, 'Scope is set');
	t.equal(importedRequest.public_key, parameters.public_key, 'Public key is set');
	t.deepEqual(importedRequest.data, parameters.data, 'Data is set');
	t.deepEqual(importedRequest.info, parameters.info, 'Info is set');

	t.ok(importedRequest.getSnapshot().equals(request.getSnapshot()),
		'Snapshot does not change after import');
	t.ok(importedRequest
		.getSignature(expectedSignerId)
		.equals(expectedSignature), 'Signature does not change after import');
	t.end();
});
