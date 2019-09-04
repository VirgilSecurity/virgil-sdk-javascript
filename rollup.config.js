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

const createEntry = (format, isBrowser) => {
	let filename = 'virgil-sdk';
	if (isBrowser || format === FORMAT.UMD) {
		filename += '.browser';
	}
	filename += `.${format}.js`;
	return {
		external: builtinModules.concat(format !== FORMAT.UMD ? Object.keys(packageJson.dependencies) : []),
		input,
		output: {
			format,
			file: path.join(outputPath, filename),
			name: 'Virgil',
		},
		plugins: [
			format === FORMAT.UMD && nodeResolve({
				browser: true,
				extensions: ['.js', '.ts'],
			}),
			format === FORMAT.UMD && commonjs(),
			replace({
				'process.browser': JSON.stringify(isBrowser),
				'process.env.VERSION': JSON.stringify(packageJson.version),
			}),
			typescript({
				exclude: ['**/*.test.ts'],
				useTsconfigDeclarationDir: true,
			}),
			format === FORMAT.UMD && terser(),
		],
	};
};

module.exports = [
	createEntry(FORMAT.CJS),
	createEntry(FORMAT.ES),
	createEntry(FORMAT.CJS, true),
	createEntry(FORMAT.ES, true),
	createEntry(FORMAT.UMD, true),
];
