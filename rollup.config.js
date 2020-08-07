const path = require('path');

const builtinModules = require('builtin-modules');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');
const typescript = require('rollup-plugin-typescript2');

const packageJson = require('./package.json');

const FORMAT = {
	CJS: 'cjs',
	ES: 'es',
	UMD: 'umd',
};

const sourcePath = path.join(__dirname, 'src');
const outputPath = path.join(__dirname, 'dist');
const input = path.join(sourcePath, 'index.ts');

const createEntry = (format, isBrowser, isNodeES) => {
	let filename = 'virgil-sdk';
	if (isBrowser) {
		filename += '.browser';
	}
	filename += `.${format}.${isNodeES ? 'mjs' : 'js'}`;

	let tsconfigOverride = format === FORMAT.ES ? { compilerOptions: { target: 'es2015' } } : {};
	return {
		external: builtinModules.concat(isBrowser ? [] : Object.keys(packageJson.dependencies)),
		input,
		output: {
			format,
			file: path.join(outputPath, filename),
			name: 'Virgil',
		},
		plugins: [
			isBrowser && nodeResolve({
				browser: true,
				extensions: ['.ts', '.js']
			}),
			isBrowser && commonjs(),
			replace({
				'process.browser': JSON.stringify(isBrowser),
				'process.env.VERSION': JSON.stringify(packageJson.version),
			}),
			typescript({
				typescript: require('typescript'),
				exclude: ['**/*.test.ts'],
				useTsconfigDeclarationDir: true,
				tsconfigOverride,
			}),
			format === FORMAT.UMD && terser(),
		].filter(Boolean),
	};
};

module.exports = [
	createEntry(FORMAT.CJS),
	createEntry(FORMAT.ES),
	createEntry(FORMAT.ES, false, true),
	createEntry(FORMAT.CJS, true),
	createEntry(FORMAT.ES, true),
	createEntry(FORMAT.UMD, true),
];
