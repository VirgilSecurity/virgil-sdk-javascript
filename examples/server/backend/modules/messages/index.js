var users = require('../users');
var messagesDal = require('./dal');

module.exports = {
	create: create,
	queryByChannel: messagesDal.queryByChannel
};

function create (params) {
	return users.findByToken(params)
		.then(user => {
			if (!user) {
				return;
			}

			// Remove token and attach sender_identifier
			delete params.token;
			params.sender_identifier = user.identifier;

			return messagesDal.create(params);
		});
}
