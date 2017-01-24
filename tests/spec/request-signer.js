var test = require('tape');
var sinon = require('sinon');

var requestSigner = require('../../src/client/request-signer');

function setup () {
	var privateKey = {};
	var snapshot = new Buffer('request snapshot');
	var signature = new Buffer('signature');
	var fingerprint = new Buffer('fingerprint');

	var request = {
		getSnapshot: sinon.stub().returns(snapshot),
		appendSignature: sinon.stub()
	};

	var crypto = {
		calculateFingerprint: sinon.stub().withArgs(snapshot)
			.returns(fingerprint),
		sign: sinon.stub().withArgs(fingerprint, privateKey)
			.returns(signature)
	};

	return {
		privateKey: privateKey,
		snapshot: snapshot,
		signature: signature,
		fingerprint: fingerprint,
		request: request,
		crypto: crypto
	};
}

test('self sign request', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var request = fixture.request;
	var privateKey = fixture.privateKey;
	var signature = fixture.signature;
	var fingerprint = fixture.fingerprint;

	var signer = requestSigner(crypto);
	signer.selfSign(request, privateKey);

	t.ok(request.appendSignature
		.calledWithExactly(fingerprint.toString('hex'), signature),
		'Use hex of fingerprint as the signer Id');
	t.end();
});

test('authority sign request', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var request = fixture.request;
	var privateKey = fixture.privateKey;
	var signature = fixture.signature;
	var signerId = 'autority_card_id';

	var signer = requestSigner(crypto);
	signer.authoritySign(
		request,
		signerId,
		privateKey);

	t.ok(request.appendSignature.calledWithExactly(signerId, signature),
		'Pass the given signer id.');
	t.end();
});
