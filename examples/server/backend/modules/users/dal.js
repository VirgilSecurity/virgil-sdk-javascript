var Promise = require('bluebird');

var users = {};

module.exports = {
	create: Promise.method(function create (params) {
		var token = Math.random() + Math.random() + '';
		users[token] = { identifier: params.identifier };
		return { identity_token: token };
	}),

	findByToken: Promise.method(function findByToken (params) {
		return users[params.token];
	})
};
