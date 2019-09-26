import { base64Encode, base64Decode, base64UrlEncode, base64UrlDecode } from '../../Lib/base64';

describe('base64', () => {
	describe('base64Encode', () => {
		it('works', () => {
			const result = base64Encode('value');
			assert.equal(result, 'dmFsdWU=');
		});
	});

	describe('base64Decode', () => {
		it('works', () => {
			const result = base64Decode('dmFsdWU=');
			assert.equal(result, 'value');
		});
	});

	describe('base64UrlEncode', () => {
		it('works', () => {
			const result = base64UrlEncode('value?=');
			assert.equal(result, 'dmFsdWU_PQ');
		});
	});

	describe('base64UrlDecode', () => {
		it('works', () => {
			const result = base64UrlDecode('dmFsdWU_PQ');
			assert.equal(result, 'value?=');
		});
	});
})
