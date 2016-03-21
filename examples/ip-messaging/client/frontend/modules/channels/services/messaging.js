import ApiClient from 'apiapi';
import config from '../../../config';

function buildApiClient (opts) {
	opts = opts || {};
	return new ApiClient({
		baseUrl: opts.baseUrl || '',

		methods: {
			joinChannel: 'post /channels/{channel_name}/join',
			getChannelMembers: 'get /channels/{channel_name}/members',
			sendMessageToChannel: 'post /channels/{channel_name}/messages',
			getChannelMessages: 'get /channels/{channel_name}/messages'
		},

		required: {
			joinChannel: ['channel_name', 'identifier'],
			getChannelMembers: ['channel_name'],
			sendMessageToChannel: ['channel_name', 'message'],
			getChannelMessages: ['channel_name'],
		},
		
		body: {
			joinChannel: ['channel_name', 'identifier'],
			getChannelMembers: ['channel_name'],
			sendMessageToChannel: ['channel_name', 'message'],
			getChannelMessages: ['channel_name', 'last_message_id']
		},

		transformRequest: transformRequest
	});
};

function transformRequest (params, body, opts) {
	if (params.identity_token) {
		opts.headers = { 'x-identity-token': params.identity_token };
	}

	return [params, body, opts];
}

module.exports = buildApiClient({ baseUrl: config.messagingBaseUrl });
