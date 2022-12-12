// @ts-nocheck
import StorageAdapter from '../../Storage/adapters/FileSystemStorageAdapter';
import { StorageEntryAlreadyExistsError } from '../../Storage/adapters/errors';

describe ('StorageAdapter', () => {
	let storage: StorageAdapter;

	beforeEach(() => {
		storage = new StorageAdapter({
			dir: '.virgil_keys_test',
			name: 'VirgilKeysTest'
		});
	});

	afterEach(() => {
		return storage.clear();
	});

	it('store and get the key', () => {
		const expected = 'one';
		return assert.eventually.equal(
			storage.store('first', expected)
				.then(() => storage.load('first'))
				.then(value => {
					return value != null && value === expected
				}),
			true,
			'loaded key is identical to the saved one'
		);
	});

	it('throws when saving key with existing name', () => {
		return assert.isRejected(
			storage.store('first', 'one')
				.then(() => storage.store('first', 'two')),
			StorageEntryAlreadyExistsError,
			'already exists'
		);
	});

	it('returns false when removing non-existent key', () => {
		return assert.eventually.isFalse(
			storage.remove('first')
		);
	});

	it('returns true when removing existent key', () => {
		return assert.eventually.isTrue(
			storage.store('first', 'one')
				.then(() => storage.remove('first'))
		);
	});

	it('store remove store', () => {
		return assert.eventually.isTrue(
			storage.store('first', 'one')
				.then(() => storage.remove('first'))
				.then(() => storage.store('first', 'two'))
				.then(() => storage.load('first'))
				.then(value => value != null && value === 'two')
		);
	});

	it ('remove item twice', () => {
		return assert.eventually.isNull(
			storage.remove('first')
				.then(() => storage.remove('first'))
				.then(() => storage.load('first'))
		);
	});

	it('store two items', () => {
		const oneExpected = 'one';
		const twoExpected = 'two';
		return assert.becomes(
			Promise.all([
				storage.store('first', oneExpected),
				storage.store('second', twoExpected)
			]).then(() => Promise.all([
					storage.load('first'),
					storage.load('second')
				])
			).then(([ one, two ]) => {
				return [
					one != null && one === oneExpected,
					two != null && two === twoExpected
				]
			}),
			[ true, true ]
		);
	});

	it('store remove three items', () => {
		return assert.eventually.isNull(
			Promise.all([
				storage.store('first', 'one'),
				storage.store('second', 'two'),
				storage.store('third', 'three')
			]).then(() => storage.remove('second'))
				.then(() => Promise.all([
						assert.eventually.isTrue(
							storage.load('first')
								.then(first => first != null && first === 'one')
						),
						assert.eventually.isNull(storage.load('second')),
						assert.eventually.isTrue(
							storage.load('third')
								.then(third => third != null && third === 'three')
						)
					])
				)
				.then(() => storage.remove('first'))
				.then(() => Promise.all([
						assert.eventually.isNull(storage.load('first')),
						assert.eventually.isTrue(
							storage.load('third')
								.then(third => third != null && third === 'three')
						)
					])
				)
				.then(() => storage.remove('third'))
				.then(() => storage.load('third'))
		);
	});

	it('store empty value', () => {
		return assert.eventually.isTrue(
			storage.store('first', '')
				.then(() => storage.load('first'))
				.then(value => value != null && value === '')
		);
	});

	it('store with weird keys', () => {
		return assert.becomes(
			Promise.all([
				storage.store(' ', 'space'),
				storage.store('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', 'control'),
				storage.store(
					'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341',
					'ten'
				),
				storage.store('\0', 'null'),
				storage.store('\0\0', 'double null'),
				storage.store('\0A', 'null A'),
				storage.store('', 'zero')
			]).then(() => {
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
				.then(values => values.map(value => value && value.toString())),
			[ 'space', 'control', 'ten', 'null', 'double null', 'null A', 'zero' ]
		);
	});

	it('exists with non-existent key', () => {
		return assert.eventually.isFalse(
			storage.exists('non-existent')
		);
	});

	it('exists with existent key', () => {
		return assert.eventually.isTrue(
			storage.store('existent', 'my value')
				.then(() => storage.exists('existent'))
		);
	});

	it('list returns empty array if storage is empty', () => {
		return assert.becomes(
			storage.list().then(entries => entries.length),
			0
		);
	});

	it('list returns array of all values', () => {
		const expectedEntries = [
			'one',
			'two',
			'three'
		];

		return Promise.all([
			storage.store('one', 'one'),
			storage.store('two', 'two'),
			storage.store('three', 'three')
		]).then(() =>
			storage.list()
		).then(entries => {
			assert.sameDeepMembers(entries, expectedEntries);
		})
	});

	it('update with existing key', () => {
		return storage.store('one', 'one')
			.then(() => storage.update('one', 'another_one'))
			.then(() => storage.load('one'))
			.then(result => {
				assert.isNotNull(result);
				assert.equal(result!.toString(), 'another_one');
			});
	});

	it('update with non-existing key creates new entry', () => {
		return storage.update('nonexistent', 'value')
			.then(() => storage.load('nonexistent'))
			.then(result => {
				assert.isNotNull(result);
				assert.equal(result!.toString(), 'value');
			});
	});
});
