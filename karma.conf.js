const replace = require('rollup-plugin-replace');
const json = require('rollup-plugin-json');
const bundleTypes = require('./scripts/rollup/bundle-types');
const getRollupPlugins = require('./scripts/rollup/get-rollup-plugins');

require('dotenv').config();

module.exports = function (config) {
	config.set({
		frameworks: [ 'mocha', 'chai', 'sinon-chai', 'chai-as-promised' ],
		autoWatch: false,
		browsers: [ 'ChromeHeadless' ],
		files: [
			{ pattern: 'scripts/register-assert-browser.js', watched: false },
			{ pattern: 'src/__tests__/index.ts', watched: false }
		],
		colors: true,
		reporters: [ 'progress' ],
		mime: { 'text/x-typescript': ['ts'] },
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,
		singleRun: true,

		preprocessors: {
			'src/**/*.ts': [ 'rollup' ]
		},

		rollupPreprocessor: {
			plugins: getRollupPlugins(bundleTypes.BROWSER).concat([

				replace({
					'process.env.API_KEY_PRIVATE_KEY': JSON.stringify(process.env.API_KEY_PRIVATE_KEY),
					'process.env.API_KEY_ID': JSON.stringify(process.env.API_KEY_ID),
					'process.env.APP_ID': JSON.stringify(process.env.APP_ID),
					'process.env.API_URL': JSON.stringify(process.env.API_URL),
				}),

				json({
					include: 'src/__tests__/**/*.json'
				})
			]),

			output: {
				format: 'iife',
				name: 'virgil',
				sourcemap: false
			}
		}
	});
};
