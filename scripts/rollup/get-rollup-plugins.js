const globals = require('rollup-plugin-node-globals');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const inject = require('rollup-plugin-inject');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const builtinModules = require('builtin-modules');
const bundleTypes = require('./bundle-types');

const BROWSER_ONLY_PLUGINS = [
	globals({
		include: [ 'buffer-es6' ]
	}),

	inject({
		include: '**/*.ts',
		exclude: 'node_modules/**',
		modules: {
			Buffer: [ 'buffer-es6', 'Buffer' ]

		}
	})
];

function getRollupPlugins (bundleType) {
	const isBrowser = bundleType !== bundleTypes.NODE;
	const isProd = bundleType === bundleTypes.BROWSER_PROD;

	return [
		resolve({
			browser: isBrowser,
			jsnext: true,
			extensions: [ '.ts', '.js' ],
			include: 'src/**/*.ts',
			preferBuiltins: !isBrowser
		}),

		typescript({
			useTsconfigDeclarationDir: true,
			tsconfigOverride: {
				compilerOptions: {
					module: 'es2015'
				}
			}
		}),

		replace({ 'process.browser': JSON.stringify(isBrowser) }),

		...(isBrowser ? BROWSER_ONLY_PLUGINS : []),

		commonjs({
			ignore: builtinModules
		}),

		...( isProd ? [ uglify() ] : [] )
	];
}

module.exports = getRollupPlugins;
