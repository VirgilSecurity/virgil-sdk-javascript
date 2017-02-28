'use strict';

var test = require('tape');
var sinon = require('sinon');
var IdentityType = require('../../src/client/card-identity-type');
var createCardManager = require('../../src/card-manager');

function setup () {

	var cryptoStub = {
		calculateFingerprint: sinon.stub().returns(new Buffer('card_fingerprint')),
		importPublicKey: sinon.stub().returns({}),
		sign: sinon.stub()
	};

	var context = /** @type {VirgilAPIContext} */{
		crypto: cryptoStub
	};

	return {
		context: context
	};
}

test('create global application card', function (t) {
	var fixture = setup();
	var ownerKeyStub = {
		sign: sinon.stub().returns(new Buffer('public_key')),
		exportPublicKey: sinon.stub().returns(new Buffer('public_key'))
	};

	var cardManager = createCardManager(fixture.context);
	var card = cardManager.createGlobal(
		'my_app_card',
		ownerKeyStub,
		IdentityType.APPLICATION);

	t.ok(card, 'creates global cards with Application type');
	t.equal(card.identityType, IdentityType.APPLICATION,
		'identity type is set correctly');
	t.end();
});

test('export card', function (t) {
	var fixture = setup();
	var ownerKeyStub = {
		sign: sinon.stub().returns(new Buffer('public_key')),
		exportPublicKey: sinon.stub().returns(new Buffer('public_key'))
	};

	var cardManager = createCardManager(fixture.context);
	var card = cardManager.createGlobal(
		'my_card',
		ownerKeyStub,
		IdentityType.EMAIL
	);

	var exportedCard = card.export();
	t.doesNotThrow(function () {
		new Buffer(exportedCard, 'base64');
	}, 'exports card as base64-encoded string');
	t.doesNotThrow(function () {
		JSON.parse(new Buffer(exportedCard, 'base64').toString('utf-8'));
	}, 'exports card as base64-encoded JSON');

	t.end();
});

test('import card', function (t) {
	var fixture = setup();
	var ownerKeyStub = {
		sign: sinon.stub().returns(new Buffer('public_key')),
		exportPublicKey: sinon.stub().returns(new Buffer('public_key'))
	};

	var cardManager = createCardManager(fixture.context);
	var card = cardManager.createGlobal(
		'my_card',
		ownerKeyStub,
		IdentityType.EMAIL
	);

	var exportedCard = card.export();

	var importedCard = cardManager.import(exportedCard);

	t.ok(importedCard, 'imports exported card');
	t.deepEqual(importedCard, card,
		'imported card is identical to the exported');
	t.end();
});
