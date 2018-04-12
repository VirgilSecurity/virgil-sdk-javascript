const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const inject = require('rollup-plugin-inject');
const replace = require('rollup-plugin-replace');
const globals = require('rollup-plugin-node-globals');
const json = require('rollup-plugin-json');
const builtinModules = require('builtin-modules');
const path = require('path');
const pkg = require('./package.json');

const browserFiles = Object.keys(pkg.browser)
	.reduce((acc, key) => {
		acc[path.resolve(key)] = path.resolve(pkg.browser[key]);
		return acc;
	}, {});

function registerAssert(files) {
	files.push({
		pattern: path.resolve('scripts/register-assert-browser.js'),
		included: true,
		served: true,
		watched: false
	});
}

registerAssert.$inject = ['config.files'];

module.exports = function (config) {
	config.set({
		frameworks: [ 'mocha', 'chai', 'sinon-chai', 'chai-as-promised', 'sinon-chai-assert' ],
		autoWatch: false,
		browsers: [ 'Chrome' ],
		files: [ { pattern: 'src/**/*.spec.ts', watched: false } ],
		colors: true,
		reporters: [ 'progress' ],
		mime: { 'text/x-typescript': ['ts'] },
		logLevel: config.LOG_INFO,
		singleRun: true,
		browserNoActivityTimeout: 60 * 1000,

		preprocessors: {
			'src/**/*.ts': [ 'rollup' ]
		},

		plugins: [
			...config.plugins,
			{'framework:sinon-chai-assert': ['factory', registerAssert]}
		],

		rollupPreprocessor: {
			plugins: [
				{
					resolveId(importee, importer) {
						if (importer) {
							const filename = path.resolve(path.dirname(importer), importee) + '.ts';
							if (filename in browserFiles) {
								return browserFiles[filename];
							}
						}
					}
				},

				typescript({
					tsconfigOverride: {
						compilerOptions: {
							module: 'es2015'
						}
					}
				}),

				replace({ 'process.browser': JSON.stringify(true) }),

				inject({
					include: '**/*.ts',
					exclude: 'node_modules/**',
					modules: {
						Buffer: [ 'buffer-es6', 'Buffer' ]
					}
				}),

				globals({
					exclude: [ 'node_modules' ]
				}),

				resolve({
					browser: true,
					jsnext: true
				}),

				commonjs({
					include: 'node_modules/**',
					ignore: builtinModules,
					ignoreGlobal: true,
					namedExports: { chai: [ 'assert', 'expect', 'should' ] }
				}),

				json({
					include: 'src/tests/**/*.json'
				})
			],

			output: {
				format: 'iife',
				name: 'virgil'
			}
		}
	});
};
