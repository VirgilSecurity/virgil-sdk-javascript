function assert(condition, errorMessage) {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function assign(target, source) {
	if (typeof Object.assign !== 'function') {
		if (target === undefined || target === null) {
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var output = Object(target);
		if (source !== undefined && source !== null) {
			for (var nextKey in source) {
				if (source.hasOwnProperty(nextKey)) {
					output[nextKey] = source[nextKey];
				}
			}
		}

		return output;
	}

	return Object.assign(target, source);
}

module.exports = {
	assert: assert,
	isEmpty: isEmpty,
	assign: assign
};
