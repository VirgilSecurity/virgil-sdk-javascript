var test = require('tape');
var virgilConfig = require('./helpers/virgil-config');
var virgil = require('../src/virgil');
var getConfirmationCode = require('./helpers/get-confirmation-code');

global.Promise = require('bluebird');

var GLOBAL_IDENTITY = 'virgil_js_sdk_test_highlevel@mailinator.com';
var KEY_NAME = 'my_global_app_key';
var KEY_PASSWORD = 'q1w2e3$';

function setup() {
	return {
		clientParams: virgilConfig,
		useBuiltInVerifiers: false
	};
}

test('generate and save key', function (t) {
	var config = setup();
	var api = virgil.API(config);
	var key = api.keys.generate();
	return key.save(KEY_NAME, KEY_PASSWORD)
		.then(function () {
			t.pass('Key saved');
			t.end();
		})
		.catch(function () {
			t.fail('Failed to generate and save key')
		});
});

test('load key', function (t) {
	var config = setup();
	var api = virgil.API(config);
	api.keys.load(KEY_NAME, KEY_PASSWORD)
		.then(function (key) {
			t.ok(key, 'Key loaded');
			t.end();
		})
		.catch(function () {
			t.fail('Failed to load key')
		});
});

test('create and publish card', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.keys.load(KEY_NAME, KEY_PASSWORD)
		.then(function (key) {
			var card = api.cards.createGlobal(GLOBAL_IDENTITY, key);
			return card.checkIdentity()
				.then(function (confirmIdentity) {
					return getConfirmationCode(GLOBAL_IDENTITY)
						.then(function (confirmationCode) {
							return confirmIdentity(confirmationCode);
						});
				})
				.then(function (validationToken) {
					return api.cards.publishGlobal(card, validationToken);
				});
		})
		.then(function () {
			t.pass('Card published');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to create and publish global card. ' + err.message);
		});
});

test('find card by identity', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.cards.findGlobal(GLOBAL_IDENTITY)
		.then(function (cards) {
			t.ok(cards.length > 0, 'Card found');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to find card. ' + err.message);
		});
});

test('get card by id', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.cards.findGlobal(GLOBAL_IDENTITY)
		.then(function (cards) {
			if (cards && cards.length > 0) {
				return cards[cards.length - 1];
			}

			throw new Error('Card matching ' + GLOBAL_IDENTITY +
				' was not found');
		})
		.then(function (card) {
			return api.cards.get(card.id);
		})
		.then(function (cardById) {
			t.ok(cardById, 'Got card by id');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to get card by id. ' + err.message);
		});
});

test('revoke card', function (t) {
	var config = setup();
	var api = virgil.API(config);

	Promise.all([
		api.keys.load(KEY_NAME, KEY_PASSWORD),
		api.cards.findGlobal(GLOBAL_IDENTITY)
	])
	.spread(function (key, cards) {
		if (!cards || cards.length === 0) {
			throw new Error('Card matching ' + GLOBAL_IDENTITY +
				' was not found');
		}

		var card = cards[cards.length - 1];
		return card.checkIdentity()
			.then(function (confirmIdentity) {
				return getConfirmationCode(GLOBAL_IDENTITY)
					.then(function (confirmationCode) {
						return confirmIdentity(confirmationCode);
					});
			})
			.then(function (validationToken) {
				return api.cards.revokeGlobal(card, key, validationToken);
			});
	})
	.then(function () {
		t.pass('Card revoked');
		t.end();
	})
	.catch(function (err) {
		t.fail('Failed to revoke card. ' + err.message);
	});
});

test('destroy key', function (t) {
	var config = setup();
	var api = virgil.API(config);

	api.keys.destroy(KEY_NAME)
		.then(function () {
			t.pass('Key destroyed');
			t.end();
		})
		.catch(function (err) {
			t.fail('Failed to destroy key. ' + err.message);
		});
});

