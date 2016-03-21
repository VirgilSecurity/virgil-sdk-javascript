var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	context: path.resolve(__dirname, '../'),
	entry: [
		path.resolve(__dirname, '../')
	],
	output: {
		path: path.resolve(__dirname, '../dist'),
		publicPath: '/dist/',
		filename: 'bundle.js',
		chunkFilename: '[name]-[chunkhash].js',
	},
	plugins: [
		new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),
		new webpack.IgnorePlugin(/\.\/dev/, /\/config$/),

		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: 'production'
			}
		}),

		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
	],
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'react-hot!babel?presets[]=react&presets[]=es2015', exclude: /node_modules/ },
			{ test: /\.eot$/,  loader: "file-loader" },
			{ test: /\.woff2?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
			{ test: /\.ttf$/,  loader: "url-loader?limit=10000&mimetype=application/octet-stream" },
			{ test: /\.svg$/,  loader: "url-loader?limit=10000&mimetype=image/svg+xml" },
			{ test: /\.css$/, loaders: ['style', 'css'] },
			{ test: /\.scss$/, loaders: ['style', 'css', 'sass'] },
		]
	},
	progress: true
};
