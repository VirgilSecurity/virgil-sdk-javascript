'use strict';
var express = require('express');
var bodyParser = require('body-parser');
var requestLog = require('express-request-log');
var config = require('../../config');
var log = require('../../providers/log');
var router = require('./routes');

var port = config.apps.messaging.port;
var app = express();

process.on('uncaughtException', function (exception) {
	log.error('fatal', exception, exception.stack);
	process.exit(75);
});

log.info('Starting application...');

app.enable('trust proxy');
app.disable('x-powered-by');

app.use(requestLog(log, { headers: true, request: true, response: false }));
app.use(bodyParser.json());

app.use(function allowOrigin (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	res.header('Access-Control-Max-Age', '1000');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-identity-token');
	next();
});

app.use(router);

app.use(function (error, request, response, next) {
	log.error('application error', error, error.stack);
	response.status(500).json({error: 'internal error'});
});

app.listen(port, function () {
	log.info('application started',
		{ pid: process.pid, port: port, environment: config.env }
	);
});

