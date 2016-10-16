import { parseJSON } from './parse-json';

export function createErrorHandler (errors) {
	return function handleError (res) {
		const data = typeof res.data === 'object'? res.data : parseJSON(res.data);

		if (data && data.code) {
			throw createError(data.code);
		}

		throw res;
	};

	function createError (code) {
		const err = new Error();
		err.message = errors[code];
		err.code = code;
		return err;
	}
}
