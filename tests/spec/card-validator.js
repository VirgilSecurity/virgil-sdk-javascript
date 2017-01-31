var test = require('tape');
var sinon = require('sinon');

var cardValidatorFactory = require('../../src/client/card-validator');
var CARDS_SERVICE_CARD_ID = '3e29d43373348cfb373b7eae189214dc01d7237765e572d' +
	'b685839b64adca853';

function setup() {
	var crypto = {
		importPublicKey: sinon.stub(),
		calculateFingerprint: sinon.stub(),
		verify: sinon.stub()
	};

	var validator = cardValidatorFactory(crypto);

	return {
		crypto: crypto,
		validator: validator
	};
}

test('ignore v3 cards', function (t) {
	var fixture = setup();
	var validator = cardValidatorFactory(fixture.crypto);
	var canValidate = validator.canValidate({ version: '3.0'});
	t.false(canValidate, 'Should not validate v3 cards');
	t.end();
});

test('verify fingerprint', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = cardValidatorFactory(crypto);
	var card = {
		version: '4.0',
		snapshot: new Buffer('fake_content_snapshot'),
		id: 'abc123'
	};

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(new Buffer('invalid_fingerprint'));

	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid content snapshot');
	t.end();
});

test('fail on invalid own signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var serviceSignature = new Buffer('service_signature');
	var ownSignature = new Buffer('owner_signature');
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[card.id] = ownSignature;
	card.signatures[CARDS_SERVICE_CARD_ID] = serviceSignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, ownSignature)
		.returns(false);
	crypto.verify.withArgs(fingerprint, serviceSignature)
		.returns(true);

	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid owner signature');
	t.end();
});

test('fail on missing own signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var serviceSignature = new Buffer('service_signature');
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[CARDS_SERVICE_CARD_ID] = serviceSignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, serviceSignature)
		.returns(true);

	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect missing owner signature');
	t.end();
});

test('fail on invalid service signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var serviceSignature = new Buffer('service_signature');
	var ownSignature = new Buffer('owner_signature');
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[card.id] = ownSignature;
	card.signatures[CARDS_SERVICE_CARD_ID] = serviceSignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, ownSignature)
		.returns(true);
	crypto.verify.withArgs(fingerprint, serviceSignature)
		.returns(false);

	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid service signature');
	t.end();
});

test('fail on missing service signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var ownSignature = new Buffer('owner_signature');
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[card.id] = ownSignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, ownSignature)
		.returns(true);

	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid service signature');
	t.end();
});

test('fail on invalid custom authority signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var serviceSignature = new Buffer('service_signature');
	var ownSignature = new Buffer('owner_signature');
	var authoritySignature = new Buffer('authority_signature');
	var authorityCardId = 'xyz321';
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[card.id] = ownSignature;
	card.signatures[CARDS_SERVICE_CARD_ID] = serviceSignature;
	card.signatures[authorityCardId] = authoritySignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, ownSignature)
		.returns(true);
	crypto.verify.withArgs(fingerprint, serviceSignature)
		.returns(true);
	crypto.verify.withArgs(fingerprint, authoritySignature)
		.returns(false);

	validator.addVerifier(authorityCardId, new Buffer('authority_key'));
	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid authority signature');
	t.end();
});

test('fail on missing custom authority signature', function (t) {
	var fixture = setup();
	var crypto = fixture.crypto;
	var validator = fixture.validator;

	var serviceSignature = new Buffer('service_signature');
	var ownSignature = new Buffer('owner_signature');
	var authorityCardId = 'xyz321';
	var fingerprint = new Buffer('abc123');
	var card = {
		id: fingerprint.toString('hex'),
		version: '4.0',
		snapshot: new Buffer('content_snapshot'),
		signatures: {}
	};

	card.signatures[card.id] = ownSignature;
	card.signatures[CARDS_SERVICE_CARD_ID] = serviceSignature;

	crypto.calculateFingerprint.withArgs(card.snapshot)
		.returns(fingerprint);
	crypto.verify.withArgs(fingerprint, ownSignature)
		.returns(true);
	crypto.verify.withArgs(fingerprint, serviceSignature)
		.returns(true);

	validator.addVerifier(authorityCardId, new Buffer('authority_key'));
	var isValid = validator.validate(card);
	t.false(isValid, 'Should detect invalid authority signature');
	t.end();
});
