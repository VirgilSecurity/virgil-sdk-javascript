const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv-webpack')
const packageJson = require('./package.json');


module.exports = function(config) {
	config.set({
		frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised'],
		autoWatch: true,
		browsers: ['ChromeHeadless'],
		files: [
			{pattern: 'scripts/register-assert.js', included: false},
			'src/__tests__/index.ts',
		],
		colors: true,
		reporters: ['progress'],
		logLevel: config.LOG_INFO,
		browserNoActivityTimeout: 60 * 1000,
		captureTimeout: 60000,
		singleRun: true,
		mime: {
			'text/x-typescript': ['ts'],
			'application/wasm': ['wasm'],
        },
		preprocessors: {
			'src/__tests__/index.ts': ['webpack'],
		},
		webpack: {
			output: {
				path: '/test',
			},
            mode: 'development',
            resolve: {
                extensions: ['.js', '.ts'],
				fallback: {
					fs: false,
					net: false,
					tls: false
				},
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader',
                    },
                    {
                        test: /\.wasm$/,
						type: "asset/inline",
                    },
                ],
            },
			experiments: {
				asyncWebAssembly: true,
			},
            plugins: [
                new dotenv({
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
