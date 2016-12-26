'use strict';

var test = require('tape');
var LocalStorage = require('../../../src/browser/storage/local-storage');

var TEST_KEY = 'Virgil.TestKeyStorage';

function setup () {
	return new LocalStorage(TEST_KEY);
}

function teardown (done) {
	window.localStorage.clear();
	done();
}

test('set and get item', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	assert.equals(storage.get('first'), 'one');
	teardown(function () { assert.end(); });
});

test('change item', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.set('first', 'two');
	assert.equals(storage.get('first'), 'two');
	teardown(function () { assert.end(); });
});

test('remove item', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.remove('first');
	assert.equals(storage.get('first'), null);
	teardown(function () { assert.end(); });
});

test('set remove set', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.remove('first');
	storage.set('first', 'two');
	assert.equals(storage.get('first'), 'two');
	teardown(function () { assert.end(); });
});

test('remove item twice', function (assert) {
	var storage = setup();
	storage.remove('first');
	storage.remove('first');
	assert.equals(storage.get('first'), null);
	teardown(function () { assert.end(); });
});

test('set two items', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.set('second', 'two');
	assert.equals(storage.get('first'), 'one');
	assert.equals(storage.get('second'), 'two');
	teardown(function () { assert.end(); });
});

test('change two items', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.set('second', 'two');
	storage.set('first', 'three');
	storage.set('second', 'four');
	assert.equals(storage.get('first'), 'three');
	assert.equals(storage.get('second'), 'four');
	teardown(function () { assert.end(); });
});

test('set remove three items', function (assert) {
	var storage = setup();
	storage.set('first', 'one');
	storage.set('second', 'two');
	storage.set('third', 'three');

	storage.remove('second');
	assert.equals(storage.get('second'), null);
	assert.equals(storage.get('first'), 'one');
	assert.equals(storage.get('third'), 'three');

	storage.remove('first');
	assert.equals(storage.get('first'), null);
	assert.equals(storage.get('third'), 'three');

	storage.remove('third');
	assert.equals(storage.get('third'), null);

	teardown(function () { assert.end(); });
});

test('set empty value', function (assert) {
	var storage = setup();
	storage.set('first', '');
	assert.equals(storage.get('first'), '');
	teardown(function () { assert.end(); });
});

test('set with weird keys', function (assert) {
	var storage = setup();

	storage.set(' ', 'space');
	storage.set('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control');
	storage.set(
		'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341', 'ten');
	storage.set('\0', 'null');
	storage.set('\0\0', 'double null');
	storage.set('\0A', 'null A');
	storage.set('', 'zero');

	assert.equals(storage.get(' '), 'space');
	assert.equals(storage.get('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`'), 'control');
	assert.equals(
		storage.get(
			'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341'),
		'ten');
	assert.equals(storage.get('\0'), 'null');
	assert.equals(storage.get('\0\0'), 'double null');
	assert.equals(storage.get('\0A'), 'null A');
	assert.equals(storage.get(''), 'zero');

	teardown(function () { assert.end(); });
});
