var ApiClient = require('apiapi');
var errors = require('./cards-errors');
var errorHandler = require('../utils/error-handler')(errors);
var parseCardResponse = require('../utils/parse-card-response');

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

		transformResponse: {
			'get': transformGetResponse,
			'search': transformSearchResponse
		}
	});

	return apiClient;
};

function transformGetResponse(res) {
	return parseCardResponse(res.data);
}

function transformSearchResponse(res) {
	return res.data.map(parseCardResponse);
}
