import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import config from './rollup.config';

export default config({
	browser: false,
	output: { file: 'dist/virgil-sdk.cjs.js', format: 'cjs' },
	plugins: [

		resolve({
			browser: false,
			jsnext: true
		}),

		commonjs()
	]
})
