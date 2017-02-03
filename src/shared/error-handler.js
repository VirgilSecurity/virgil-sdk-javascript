var parseJSON = require('./parse-json');
var throwVirgilError = require('./utils').throwVirgilError;

module.exports = function createErrorHandler (errors) {
	return function handleError (res) {
		var data = res.response ? res.response.data :
			(typeof res.data === 'object'? res.data : parseJSON(res.data));

		if (data && data.code) {
			throwVirgilError(errors[data.code], {
				code: data.code
			});
		}

		throw res;
	};
};
