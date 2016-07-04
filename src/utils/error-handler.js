var parseJSON = require('./parse-json');
module.exports = function createErrorHandler (errors) {
	return function handleError (res) {
		var data = typeof res.data === 'object'? res.data : parseJSON(res.data);

		if (data && data.code) {
			throw createError(data.code);
		}

		throw res;
	};

	function createError (code) {
		var err = new Error();
		err.message = errors[code];
		err.code = code;
		return err;
	}
};
