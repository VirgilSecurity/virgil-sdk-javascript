var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('../frontend/webpack/dev.config');

var devServerConfig = {
	publicPath: webpackConfig.output.publicPath,
	contentBase: webpackConfig.context,
	proxy: {
        '/api/*': {
            target: 'http://localhost:4000'
        }
    },
	hot: true,
	historyApiFallback: true
};

var server = new WebpackDevServer(webpack(webpackConfig), devServerConfig);

server.listen(3000, 'localhost', function (err, result) {
	if (err) {
		console.log(err);
	}
	console.log('Listening at localhost:3000');
});
