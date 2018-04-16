import { KeyStorage } from '../../Sdk/Lib/KeyStorage/index';
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
		return assert.eventually.equal(
			storage.save('first', expected)
				.then(() => storage.load('first'))
				.then(value => {
					return value != null && value.equals(expected)
				}),
			true,
			'loaded key is identical to the saved one'
		);
	});

	it('throws when saving key with existing name', () => {
		return assert.isRejected(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.save('first', Buffer.from('two'))),
			PrivateKeyExistsError
		);
	});

	it('returns false when removing non-existent key', () => {
		return assert.eventually.isFalse(
			storage.remove('first')
		);
	});

	it('returns true when removing existent key', () => {
		return assert.eventually.isTrue(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.remove('first'))
		);
	});

	it('set remove set', () => {
		return assert.eventually.isTrue(
			storage.save('first', Buffer.from('one'))
				.then(() => storage.remove('first'))
				.then(() => storage.save('first', Buffer.from('two')))
				.then(() => storage.load('first'))
				.then(value => value != null && value!.equals(Buffer.from('two')))
		);
	});

	it ('remove item twice', () => {
		return assert.eventually.isNull(
			storage.remove('first')
				.then(() => storage.remove('first'))
				.then(() => storage.load('first'))
		);
	});

	it('set two items', () => {
		const oneExpected = Buffer.from('one');
		const twoExpected = Buffer.from('two');
		return assert.becomes(
			Promise.all([
				storage.save('first', oneExpected),
				storage.save('second', twoExpected)
			]).then(() => Promise.all([
					storage.load('first'),
					storage.load('second')
				])
			).then(([ one, two ]) => {
				return [
					one != null && one.equals(oneExpected),
					two != null && two.equals(twoExpected)
				]
			}),
			[ true, true ]
		);
	});

	it('set remove three items', () => {
		return assert.eventually.isNull(
			Promise.all([
				storage.save('first', Buffer.from('one')),
				storage.save('second', Buffer.from('two')),
				storage.save('third', Buffer.from('three'))
			]).then(() => storage.remove('second'))
				.then(() => Promise.all([
						assert.eventually.isTrue(
							storage.load('first')
								.then(first => first != null && first.toString() === 'one')
						),
						assert.eventually.isNull(storage.load('second')),
						assert.eventually.isTrue(
							storage.load('third')
								.then(third => third != null && third.toString() === 'three')
						)
					])
				)
				.then(() => storage.remove('first'))
				.then(() => Promise.all([
						assert.eventually.isNull(storage.load('first')),
						assert.eventually.isTrue(
							storage.load('third')
								.then(third => third != null && third.toString() === 'three')
						)
					])
				)
				.then(() => storage.remove('third'))
				.then(() => storage.load('third'))
		);
	});

	it('set empty value', () => {
		return assert.eventually.isTrue(
			storage.save('first', new Buffer(0))
				.then(() => storage.load('first'))
				.then(value => value != null && value.equals(new Buffer(0)))
		);
	});

	it('set with weird keys', () => {
		return assert.becomes(
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
			storage.save('existent', Buffer.from('my value'))
				.then(() => storage.exists('existent'))
		);
	});
});
