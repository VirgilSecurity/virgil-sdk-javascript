'use strict';

var test = require('tape');

module.exports = function (setup, teardown) {
	test('set and get item', function (t) {
		var storage = setup();
		var expected = 'one';
		storage.save('first', expected)
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equal(value, expected,
					'loaded item is identical to the saved one');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('change item', function (t) {
		var storage = setup();
		storage.save('first', 'one')
			.then(function () {
				return storage.save('first', 'two');
			})
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equals(value, 'two', 'changes existing items');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('remove item', function (t) {
		var storage = setup();
		storage.save('first', 'one')
			.then(function () {
				return storage.remove('first');
			})
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equals(value, null, 'removes items');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('set remove set', function (t) {
		var storage = setup();
		storage.save('first', 'one')
			.then(function () {
				return storage.remove('first');
			})
			.then(function () {
				return storage.save('first', 'two');
			})
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equals(value, 'two');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('remove item twice', function (t) {
		var storage = setup();
		storage.remove('first')
			.then(function () {
				return storage.remove('first');
			})
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equals(value, null);
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('set two items', function (t) {
		var storage = setup();
		Promise.all([
			storage.save('first', 'one'),
			storage.save('second', 'two')
		])
			.then(function () {
				return Promise.all([
					storage.load('first'),
					storage.load('second')
				]);
			})
			.then(function (values) {
				t.equals(values[0], 'one');
				t.equals(values[1], 'two');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('change two items', function (t) {
		var storage = setup();
		Promise.all([
			storage.save('first', 'one'),
			storage.save('second', 'two')
		])
			.then(function () {
				return Promise.all([
					storage.save('first', 'three'),
					storage.save('second', 'four')
				]);
			})
			.then(function () {
				return Promise.all([
					storage.load('first'),
					storage.load('second')
				]);
			})
			.then(function (values) {
				t.equals(values[0], 'three');
				t.equals(values[1], 'four');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('set remove three items', function (t) {
		var storage = setup();
		Promise.all([
			storage.save('first', 'one'),
			storage.save('second', 'two'),
			storage.save('third', 'three')
		])
			.then(function () {
				return storage.remove('second');
			})
			.then(function () {
				return Promise.all([
					storage.load('first'),
					storage.load('second'),
					storage.load('third')
				]);
			})
			.then(function (values) {
				t.equals(values[0], 'one');
				t.equals(values[1], null);
				t.equals(values[2], 'three');
			})
			.then(function () {
				return storage.remove('first');
			})
			.then(function () {
				return Promise.all([
					storage.load('first'),
					storage.load('third')
				]);
			})
			.then(function (values) {
				t.equals(values[0], null);
				t.equals(values[1], 'three');
			})
			.then(function () {
				return storage.remove('third');
			})
			.then(function () {
				return storage.load('third');
			})
			.then(function (value) {
				t.equals(value, null);
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('set empty value', function (t) {
		var storage = setup();
		storage.save('first', '')
			.then(function () {
				return storage.load('first');
			})
			.then(function (value) {
				t.equals(value, '');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('set with weird keys', function (t) {
		var storage = setup();

		Promise.all([
			storage.save(' ', 'space'),
			storage.save('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control'),
			storage.save(
				'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341', 'ten'),
			storage.save('\0', 'null'),
			storage.save('\0\0', 'double null'),
			storage.save('\0A', 'null A'),
			storage.save('', 'zero')
		])
			.then(function () {
				return Promise.all([
					storage.load(' '),
					storage.load('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`'),
					storage.load(
						'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341'),
					storage.load('\0'),
					storage.load('\0\0'),
					storage.load('\0A'),
					storage.load('')
				]);
			})
			.then(function (values) {
				t.equals(values[0], 'space');
				t.equals(values[1], 'control');
				t.equals(values[2], 'ten');
				t.equals(values[3], 'null');
				t.equals(values[4], 'double null');
				t.equals(values[5], 'null A');
				t.equals(values[6], 'zero');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('exists with non-existent key', function (t) {
		var storage = setup();

		storage.exists('non-existent')
			.then(function (exists) {
				t.false(exists, 'returns false for non-existent key');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});

	test('exists with existent key', function (t) {
		var storage = setup();

		storage.save('existent', 'my value')
			.then(function () {
				return storage.exists('existent');
			})
			.then(function (exists) {
				t.ok(exists, 'returns true for existent key');
			})
			.then(function () {
				teardown(function () { t.end(); });
			})
			.catch(function (err) {
				teardown(function () { t.fail(err); });
			});
	});
};
