const commonjs = require('rollup-plugin-commonjs');
const inject = require('rollup-plugin-inject');
const json = require('rollup-plugin-json');
const nodeGlobals = require('rollup-plugin-node-globals');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const typescript = require('rollup-plugin-typescript2');
const wasm = require('rollup-plugin-wasm');

const packageJson = require('./package.json');

require('dotenv').config();

module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised'],
		autoWatch: false,
		browsers: ['ChromeHeadless'],
		files: [
			{ pattern: 'scripts/register-assert-browser.js' },
			{ pattern: 'src/__tests__/index.ts' },
			{ pattern: 'node_modules/virgil-crypto/dist/libfoundation.browser.wasm', included: false }
		],
		proxies: {
			'/base/src/__tests__/libfoundation.browser.wasm': '/base/node_modules/virgil-crypto/dist/libfoundation.browser.wasm'
		},
		colors: true,
		reporters: ['progress'],
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,
		singleRun: true,
		preprocessors: {
			'src/**/*.ts': ['rollup']
		},
		rollupPreprocessor: {
			output: {
				format: 'iife',
				name: 'virgil',
				sourcemap: false
			},
			plugins: [
				nodeResolve({
					browser: true,
					extensions: ['.js', '.ts'],
				}),
				commonjs(),
				replace({
					'process.browser': JSON.stringify(true),
					'process.env.VERSION': JSON.stringify(packageJson.version),
					'process.env.API_KEY_PRIVATE_KEY': JSON.stringify(process.env.API_KEY_PRIVATE_KEY),
					'process.env.API_KEY_ID': JSON.stringify(process.env.API_KEY_ID),
					'process.env.APP_ID': JSON.stringify(process.env.APP_ID),
					'process.env.API_URL': JSON.stringify(process.env.API_URL),
				}),
				typescript(),
				nodeGlobals(),
				inject({
					modules: {
						Buffer: ['buffer-es6', 'Buffer'],
					},
				}),
				json(),
				// workaround. maybe there is a better way to handle it
				wasm()
			]
		}
	});
};
