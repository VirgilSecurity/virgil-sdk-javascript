import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
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
