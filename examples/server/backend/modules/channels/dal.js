var Promise = require('bluebird');
var _ = require('lodash');
var db = require('../../providers/db');

module.exports = {
	addMember: Promise.method(function join (params) {
		var existingMembers = db.channels[params.channel_name].members;

		// Update channel members
		db.channels[params.channel_name].members = _.uniqBy(
			existingMembers.concat([{ identifier: params.identifier }]),
			'identifier'
		);

		return db.channels[params.channel_name].members;
	}),

	query: Promise.method(function query () {
		return db.channels;
	}),

	create: Promise.method(function create (params) {
		if (!db.channels[params.channel_name]) {
			db.channels[params.channel_name] = { messages: [], members: [] };
		}
	}),

	findByName: Promise.method(function findByName (params) {
		return db.channels[params.channel_name];
	})
};
