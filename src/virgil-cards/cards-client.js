import ApiClient from 'apiapi';
import { errors } from './errors';
import { createErrorHandler } from '../utils/error-handler';
import { parseCardResponse } from '../utils/parse-card-response';

const errorHandler = createErrorHandler(errors);

export function createCardsClient (applicationToken, opts = {}) {
	const apiClient = new ApiClient({
		baseUrl: opts.cardsBaseUrl || 'https://cards.virgilsecurity.com/v4',

		methods: {
			create: 'post /card',
			revoke: 'delete /card/{card_id}'
		},

		headers: {
			'Authorization': 'VIRGIL ' + applicationToken
		},

		transformRequest: {
			create: create,
			revoke: revoke
		},

		body: {
			create: ['content_snapshot', 'meta'],
			revoke: ['content_snapshot', 'meta']
		},

		required: {
			create: ['content_snapshot', 'meta'],
			revoke: ['content_snapshot', 'meta']
		},

		errorHandler: errorHandler,

		transformResponse: {
			create: transformCreateResponse
		}
	});

	return apiClient;
}

function revoke (params, requestBody, opts) {
	this.assert(params.content_snapshot, '"content_snapshot" parameter is required');
	this.assert(params.meta, '"meta" parameter is required');
	this.assert(params.meta.signs, '"meta.signs" parameter is required');

	return [params, requestBody, opts];
}

function create (params, requestBody, opts) {
	this.assert(params.content_snapshot, '"content_snapshot" parameter is required');
	this.assert(params.meta, '"meta" parameter is required');
	this.assert(params.meta.signs, '"meta.signs" parameter is required');

	return [params, requestBody, opts];
}

function transformCreateResponse (res) {
	return parseCardResponse(res.data);
}
