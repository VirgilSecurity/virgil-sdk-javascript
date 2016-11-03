function assert(condition, errorMessage) {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function assign(target, firstSource) {
	// Object.assign polyfill taken from MDN
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	if (typeof Object.assign !== 'function') {
		if (target === undefined || target === null) {
			throw new TypeError('Cannot convert first argument to object');
		}

		var to = Object(target);
		for (var i = 1; i < arguments.length; i++) {
			var nextSource = arguments[i];
			if (nextSource === undefined || nextSource === null) {
				continue;
			}

			var keysArray = Object.keys(Object(nextSource));
			for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
				var nextKey = keysArray[nextIndex];
				var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
				if (desc !== undefined && desc.enumerable) {
					to[nextKey] = nextSource[nextKey];
				}
			}
		}
		return to;
	}

	return Object.assign.apply(null, arguments);
}

module.exports = {
	assert: assert,
	isEmpty: isEmpty,
	assign: assign
};
