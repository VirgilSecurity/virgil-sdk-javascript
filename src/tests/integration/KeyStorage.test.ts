import { KeyStorage } from '../../Sdk/Lib/KeyStorage';
import { PrivateKeyExistsError } from '../../Sdk/Lib/KeyStorage/PrivateKeyExistsError';

describe('KeyStorage', () => {
	let storage: KeyStorage;

	beforeEach(() => {
		storage = new KeyStorage();
	});

	afterEach(() => {
		return storage.clear();
	});

	it('set and get the key', () => {
		const expected = Buffer.from('one');
		return assert.isFulfilled(
			storage.save('first', expected)
				.then(() => storage.load('first'))
				.then(value => {
					assert.exists(value);
					assert.isTrue(value!.equals(expected),
						'loaded key is identical to the saved one');
				})
		);
	});

	it('throws when saving key with existing name', () => {
		return assert.isRejected(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.save('first', Buffer.from('two'))),
			PrivateKeyExistsError
		);
	});

	it('removes the key', () => {
		return assert.isFulfilled(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.remove('first'))
				.then(isRemoved => {
					assert.isTrue(isRemoved, 'returns true when key existed');
					return storage.load('first');
				})
				.then( value => {
					assert.isNull(value,'removes items');
				})
		);
	});

	it('set remove set', () => {
		return assert.isFulfilled(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.remove('first'))
				.then((isRemoved) => {
					assert.isTrue(isRemoved, 'returns true when key existed');
					return storage.save('first', Buffer.from('two'));
				})
				.then(() => storage.load('first'))
				.then(value => {
					assert.isNotNull(value)
					assert.isTrue(value!.equals(Buffer.from('two')));
				})
		);
	});

	it ('remove item twice', () => {
		return assert.isFulfilled(
			storage.remove('first')
				.then(isRemoved => {
					assert.isFalse(isRemoved, 'returns false for non-existent key');
					return storage.remove('first');
				})
				.then(isRemoved => {
					assert.isFalse(isRemoved, 'returns false the second time');
					return storage.load('first');
				})
				.then(value => {
					assert.isNull(value);
				})
		);
	});

	it('set two items', () => {
		return assert.isFulfilled(
			Promise.all([
				storage.save('first', Buffer.from('one')),
				storage.save('second', Buffer.from('two'))
			]).then(() => Promise.all([
					storage.load('first'),
					storage.load('second')
				])
			).then(([ one, two ]) => {
				assert.isNotNull(one);
				assert.isNotNull(two);
				assert.equal(one!.toString(), 'one');
				assert.equal(two!.toString(), 'two');
			})
		);
	});

	it('set remove three items', () => {
		return assert.isFulfilled(
			Promise.all([
				storage.save('first', Buffer.from('one')),
				storage.save('second', Buffer.from('two')),
				storage.save('third', Buffer.from('three'))
			]).then(() => storage.remove('second'))
				.then(() => Promise.all([
						storage.load('first'),
						storage.load('second'),
						storage.load('third')
					])
				)
				.then(([ first, second, third ]) => {
					assert.equal(first!.toString(), 'one');
					assert.isNull(second);
					assert.equal(third!.toString(), 'three');
				})
				.then(() => storage.remove('first'))
				.then(() => Promise.all([
						storage.load('first'),
						storage.load('third')
					])
				)
				.then(([ first, third ]) => {
					assert.isNull(first);
					assert.equal(third!.toString(), 'three');
				})
				.then(() => storage.remove('third'))
				.then(() => storage.load('third'))
				.then(value => {
					assert.isNull(value);
				})
		);
	});

	it('set empty value', () => {
		return assert.isFulfilled(
			storage.save('first', new Buffer(0))
				.then(() => storage.load('first'))
				.then(value => {
					assert.isNotNull(value);
					assert.isTrue(value!.equals(new Buffer(0)))
				})
		);
	});

	it('set with weird keys', () => {
		return assert.isFulfilled(
			Promise.all([
				storage.save(' ', Buffer.from('space')),
				storage.save('=+!@#$%^&*()-_\\|;:\'",./<>?[]{}~`', Buffer.from('control')),
				storage.save(
					'\u4e00\u4e8c\u4e09\u56db\u4e94\u516d\u4e03\u516b\u4e5d\u5341',
					Buffer.from('ten')
				),
				storage.save('\0', Buffer.from('null')),
				storage.save('\0\0', Buffer.from('double null')),
				storage.save('\0A', Buffer.from('null A')),
				storage.save('', Buffer.from('zero'))
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
				.then(values => {
					assert.equal(values[0]!.toString(), 'space');
					assert.equal(values[1]!.toString(), 'control');
					assert.equal(values[2]!.toString(), 'ten');
					assert.equal(values[3]!.toString(), 'null');
					assert.equal(values[4]!.toString(), 'double null');
					assert.equal(values[5]!.toString(), 'null A');
					assert.equal(values[6]!.toString(), 'zero');
				})
		);
	});

	it('exists with non-existent key', () => {
		return assert.isFulfilled(
			storage.exists('non-existent')
				.then(exists => {
					assert.isFalse(exists);
				})
		);
	});

	it('exists with existent key', () => {
		return assert.isFulfilled(
			storage.save('existent', Buffer.from('my value'))
				.then(() => storage.exists('existent'))
				.then(exists => {
					assert.isTrue(exists, 'returns true for existent key');
				})
		);
	});
});
