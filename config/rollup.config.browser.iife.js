import commonjs from 'rollup-plugin-commonjs';
import inject from 'rollup-plugin-inject';
import globals from 'rollup-plugin-node-globals';
import resolve from 'rollup-plugin-node-resolve';
import config from './rollup.config';

export default config({
	browser: true,
	output: { file: 'dist/virgil-sdk.browser.iife.js', name: 'virgil', format: 'iife' },
	plugins: [

		inject({
			include: '**/*.ts',
			exclude: 'node_modules/**',
			modules: {
				Buffer: ['buffer-es6', 'Buffer']
			}
		}),

		globals(),

		resolve({
			browser: true,
			jsnext: true
		}),

		commonjs({ ignoreGlobal: true })
	]
})
