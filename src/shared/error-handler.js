var parseJSON = require('./parse-json');
var createError = require('./utils').createError;

module.exports = function createErrorHandler (errors) {
	return function handleError (error) {
		var data = error.response ? error.response.data : error.data;
		if (typeof data === 'string') {
			data = parseJSON(data);
		}

		if (data && data.code) {
			throw createError(errors[data.code], {
				code: data.code
			});
		}

		throw error;
	};
};
