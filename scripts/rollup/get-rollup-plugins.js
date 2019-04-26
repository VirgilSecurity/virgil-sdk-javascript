const globals = require('rollup-plugin-node-globals');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const typescript = require('rollup-plugin-typescript2');
const inject = require('rollup-plugin-inject');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');
const bundleTypes = require('./bundle-types');
const packageJson = require('../../package.json');

function getRollupPlugins (bundleType) {
	const isBrowser = bundleType !== bundleTypes.NODE;
	const isProd = bundleType === bundleTypes.BROWSER_PROD;

	return [
		resolve({
			browser: isBrowser,
			extensions: [ '.ts', '.js' ],
			preferBuiltins: !isBrowser
		}),

		commonjs(),

		typescript({
			useTsconfigDeclarationDir: true,
			typescript: require('typescript')
		}),

		replace({
			'process.browser': JSON.stringify(isBrowser),
			'process.env.VERSION': JSON.stringify(packageJson.version)
		}),

		isBrowser && globals(),
		isBrowser && inject({
			include: '**/*.ts',
			exclude: 'node_modules/**',
			modules: {
				Buffer: [ 'buffer-es6', 'Buffer' ]
			}
		}),

		isProd && uglify()
	];
}

module.exports = getRollupPlugins;
