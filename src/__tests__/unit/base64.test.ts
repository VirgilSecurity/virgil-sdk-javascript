import { expect } from 'chai';

import { base64Encode, base64Decode, base64UrlEncode, base64UrlDecode } from '../../Lib/base64';

describe('base64', () => {
	describe('base64Encode', () => {
		it('works', () => {
			const result = base64Encode('value');
			expect(result).to.equal('dmFsdWU=');
		});
	});

	describe('base64Decode', () => {
		it('works', () => {
			const result = base64Decode('dmFsdWU=');
			expect(result).to.equal('value');
		});
	});

	describe('base64UrlEncode', () => {
		it('works', () => {
			const result = base64UrlEncode('value?=');
			expect(result).to.equal('dmFsdWU_PQ');
		});
	});

	describe('base64UrlDecode', () => {
		it('works', () => {
			const result = base64UrlDecode('dmFsdWU_PQ');
			expect(result).to.equal('value?=');
		});
	});
})
