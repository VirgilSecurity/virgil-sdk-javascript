var test = require('tape');
var CardModel = require('../../src/client/card-model');
var CardScope = require('../../src/client/card-scope');

function setup () {
	var pubkey = 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHYk1CUUdCeXFHU000' +
		'OUFnRUdDU3NrQXdNQ0NBRUJEUU9CZ2dBRUNhV3k5VVVVMDFWcjdQLzExWHpubk0vR' +
		'AowTi9KODhnY0dMV3pYMGFLaGcxSjdib3B6RGV4b0QwaVl3alFXVUpWcVpJQjRLdF' +
		'VneG9IcS81c2lybUI2cW1OClNFODNxcTZmbitPSm9qeUpGMytKY1AwTUp1WXRVZnp' +
		'HbjgvUHlHVkp1TEVHais0NTlKWTRWbzdKb1pnS2hBT24KcWJ3UjRlcTY0citlUEpN' +
		'cUppMD0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t';

	var props = {
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

	var cardId = 'card123';
	var contentSnapshot = new Buffer(JSON.stringify(props)).toString('base64');
	var signerId = 'bb5db5084dab511135ec24c2fdc5ce2bca8f7bf6b0b83a7fa4c3cb' +
		'dcdc740a59';
	var signature = 'MIGaMA0GCWCGSAFlAwQCAgUABIGIMIGFAkAUkHTx9vEXcUAq9O5bRs' +
		'fJ0K5s8Bwm55gEXfzbdtAfr6ihJOXA9MAdXOEocqKtH6DuU7zJAdWgqfTrweih7jAk' +
		'EAgN7CeUXwZwS0lRslWulaIGvpK65czWphRwyuwN++hI6dlHOdPABmhMSqimwoRsLN' +
		'8xsivhPqQdLow5rDFic7A=';
	var meta = {
		card_version: '4.0',
		created_at: new Date(Date.UTC(2017, 0, 22, 7, 3, 42)).toISOString(),
		signs: { }
	};

	meta.signs[signerId] = signature;

	return {
		cardId: cardId,
		props: props,
		contentSnapshot: contentSnapshot,
		meta: meta,
		dto: {
			id: cardId,
			content_snapshot: contentSnapshot,
			meta: meta
		},
		signerId: signerId,
		signature: signature
	};
}

test('import card from DTO', function (t) {
	var fixture = setup();
	var card = CardModel.import(fixture.dto);

	t.ok(card, 'CardModel is created');
	t.equal(card.id, fixture.cardId, 'Id is set correctly');
	t.equal(card.identity, fixture.props.identity, 'Identity is set correctly');
	t.equal(card.identityType, fixture.props.identity_type,
		'Identity type is set correctly');
	t.equal(card.scope, fixture.props.scope, 'Scope is set correctly');
	t.ok(card.publicKey.equals(new Buffer(fixture.props.public_key, 'base64')),
		'Public key is set correctly');
	t.ok(card.signatures[fixture.signerId]
		.equals(new Buffer(fixture.signature, 'base64')),
		'Signature is set correctly');

	t.equal(card.createdAt.getTime(),
		new Date(fixture.meta.created_at).getTime(),
		'Created at is set correctly');
	t.equal(card.version, fixture.meta.card_version,
		'Version is set correctly');
	t.deepEqual(card.data, fixture.props.data, 'User data is set correctly');
	t.equal(card.device, fixture.props.info.device, 'Device is set correctly');
	t.equal(card.deviceName, undefined, 'Device name is set correctly');

	t.end();
});

test('export card to DTO', function (t) {
	var fixture = setup();
	var card = CardModel.import(fixture.dto);

	var exportedCard = card.export();
	t.deepEqual(exportedCard, fixture.dto);
	t.end();
});
