const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const inject = require('rollup-plugin-inject');
const replace = require('rollup-plugin-replace');
const json = require('rollup-plugin-json');
const builtinModules = require('builtin-modules');

require('dotenv').config();

module.exports = function (config) {
	config.set({
		frameworks: [ 'mocha', 'chai', 'sinon-chai', 'chai-as-promised' ],
		autoWatch: false,
		browsers: [ 'Chrome' ],
		files: [
			{ pattern: 'scripts/register-assert-browser.js', watched: false },
			{ pattern: 'src/tests/integration/index.ts', watched: false }
		],
		colors: true,
		reporters: [ 'progress' ],
		mime: { 'text/x-typescript': ['ts'] },
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,

		preprocessors: {
			'src/**/*.ts': [ 'rollup' ]
		},

		rollupPreprocessor: {
			plugins: [

				resolve({
					browser: true,
					jsnext: true,
					extensions: [ '.ts', '.js' ],
					include: 'src/**/*.ts',
					preferBuiltins: false
				}),

				typescript({
					tsconfigOverride: {
						compilerOptions: {
							module: 'es2015'
						}
					}
				}),

				replace({
					'process.browser': JSON.stringify(true),
					'process.env.API_KEY_PRIVATE_KEY': JSON.stringify(process.env.API_KEY_PRIVATE_KEY),
					'process.env.API_KEY_ID': JSON.stringify(process.env.API_KEY_ID),
					'process.env.APP_ID': JSON.stringify(process.env.APP_ID),
					'process.env.API_URL': JSON.stringify(process.env.API_URL),
				}),

				inject({
					include: '**/*.ts',
					exclude: 'node_modules/**',
					modules: {
						Buffer: [ 'buffer', 'Buffer' ]
					}
				}),

				commonjs({
					ignore: builtinModules
				}),

				json({
					include: 'src/tests/**/*.json'
				})
			],

			output: {
				format: 'iife',
				name: 'virgil',
				sourcemap: false
			}
		}
	});
};
