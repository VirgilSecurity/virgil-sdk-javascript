import ApiClient from 'apiapi';
import { errors } from './errors';
import { createErrorHandler } from '../utils/error-handler';
import { parseCardResponse } from '../utils/parse-card-response';

const errorHandler = createErrorHandler(errors);

export function createReadCardsClient (applicationToken, opts = {}) {

	const apiClient = new ApiClient({
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
}

function transformGetResponse(res) {
	return parseCardResponse(res.data);
}

function transformSearchResponse(res) {
	return res.data.map(parseCardResponse);
}
