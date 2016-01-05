module.exports = function createErrorHandler (errors) {
	return function handleError (res) {
		if (res.data.code) {
			throw createError(res.data.code);
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
