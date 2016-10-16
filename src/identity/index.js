import ApiClient from 'apiapi';
import { errors } from './errors';
import { createErrorHandler } from '../utils/error-handler';

const errorHandler = createErrorHandler(errors);

export function createIdentityClient (opts) {
	opts = typeof opts === 'object' ? opts : {};

	var apiClient = new ApiClient({
		baseUrl: opts.identityBaseUrl || 'https://identity.virgilsecurity.com/v1',

		methods: {
			verify: 'post /verify',
			confirm: 'post /confirm',
			validate: 'post /validate'
		},

		transformRequest: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		required: {
			verify: ['type', 'value'],
			confirm: ['confirmation_code', 'action_id', 'token'],
			validate: ['type', 'value', 'validation_token']
		},

		errorHandler: errorHandler
	});

	return apiClient;
}
