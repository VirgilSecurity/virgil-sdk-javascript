var Promise = require('bluebird');
var _ = require('lodash');
var db = require('../../providers/db');

module.exports = {
	create: Promise.method(function create (params) {
		params.id = _.uniqueId();
		params.created_at = Date.now();
		db.channels[params.channel_name].messages.push(params);
		return db.channels[params.channel_name].messages;
	}),

	queryByChannel: Promise.method(function queryByChannel (params) {
		var messages = db.channels[params.channel_name].messages;

		if (params.last_message_id) {
			var index = _.findIndex(messages, { id: params.last_message_id });
			return messages.slice(index + 1);
		}

		return messages;
	})
};
