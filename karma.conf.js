const path = require('path');
const webpack = require('webpack');

const packageJson = require('./package.json');

require('dotenv').config();

module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised'],
		autoWatch: false,
		browsers: ['ChromeHeadless'],
		files: [
			'scripts/register-assert-browser.js',
			'src/__tests__/index.ts',
		],
		colors: true,
		reporters: ['progress'],
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,
		singleRun: true,
		mime: {
			'text/x-typescript': ['ts'],
			'application/wasm': ['wasm'],
        },
		preprocessors: {
			'src/__tests__/index.ts': ['webpack']
		},
		webpack: {
            mode: 'production',
            resolve: {
                extensions: ['.js', '.ts'],
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.wasm$/,
                        type: 'javascript/auto',
                        loader: 'file-loader',
                    },
                ],
            },
            plugins: [
                new webpack.EnvironmentPlugin({
					browser: JSON.stringify(true),
					VERSION: JSON.stringify(packageJson.version),
					API_KEY_PRIVATE_KEY: JSON.stringify(process.env.APP_KEY),
					API_KEY_ID: JSON.stringify(process.env.APP_KEY_ID),
					APP_ID: JSON.stringify(process.env.APP_ID),
					API_URL: JSON.stringify(process.env.API_URL),
                }),
            ],
        },
	});
};
