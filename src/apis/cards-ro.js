var ApiClient = require('apiapi');
var errors = require('./cards-errors');
var errorHandler = require('../shared/error-handler')(errors);

module.exports = function createReadCardsClient (applicationToken, opts) {
	var apiClient = new ApiClient({
		baseUrl: opts.cardsReadBaseUrl || 'https://cards-ro.virgilsecurity.com/v4',

		methods: {
			search: 'post /card/actions/search',
			get: 'get /card/{card_id}'
		},

		headers: {
			'Authorization': 'VIRGIL ' + applicationToken
		},

		body: {
			search: ['identities', 'identity_type', 'scope']
		},

		required: {
			search: ['identities']
		},

		errorHandler: errorHandler,

		transformResponse: function transformResponse (res) {
			return res.data;
		}
	});

	return apiClient;
};
