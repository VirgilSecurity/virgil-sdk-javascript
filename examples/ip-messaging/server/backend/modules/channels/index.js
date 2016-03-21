var Promise = require('bluebird');
var channelsDal = require('./dal');
var users = require('../users');

module.exports = {
	addMember: addMember,
	getMembers: getMembers
};

function addMember (params) {
	return Promise.all([
		assertChannel(params),
		users.create(params)
	])
		.spread((channel, user) => {
			return channelsDal.addMember(params)
				.return(user);
		});
}

function assertChannel (params) {
	return channelsDal.findByName(params)
		.then(channel => {
			if (!channel) {
				return channelsDal.create(params);
			}
		});
}

function getMembers (params) {
	return channelsDal.findByName(params)
		.then(channel => {
			if (channel) {
				return channel.members;
			}
		});
}
