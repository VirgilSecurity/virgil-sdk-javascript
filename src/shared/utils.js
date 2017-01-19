function stringToBuffer(str, encoding) {
	encoding = encoding || 'utf8';
	return new Buffer(str, encoding);
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

function isString(obj) {
	return typeof obj === 'string';
}

function isFunction(obj) {
	return typeof obj === 'function';
}

function isNumber(obj) {
	return typeof obj === 'number';
}

function isBuffer(obj) {
	return Buffer.isBuffer(obj);
}

function assert(condition, errorMessage) {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

function assign(target, firstSource) {
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

function inherits(ctor, superCtor) {
	ctor.super_ = superCtor;
	ctor.prototype = Object.create(superCtor.prototype, {
		constructor: {
			value: ctor,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});

	/**
	 * Calls superclass constructor/method.
	 *
	 * This function is only available if you use {code: inherits} to
	 * express inheritance relationships between classes.
	 *
	 * @param {!Object} me Should always be "this".
	 * @param {string} methodName The method name to call. Calling
	 *     superclass constructor can be done with the special string
	 *     'constructor'.
	 * @param {...*} var_args The arguments to pass to superclass
	 *     method/constructor.
	 * @return {*} The return value of the superclass method/constructor.
	 */
	ctor.base = function(me, methodName, var_args) {
		var args = new Array(arguments.length - 2);
		for (var i = 2; i < arguments.length; i++) {
			args[i - 2] = arguments[i];
		}
		return superCtor.prototype[methodName].apply(me, args);
	};
}

function abstractMethod () {
	throw new Error('This method should be overridden by derived class.');
}

module.exports = {
	assert: assert,
	isEmpty: isEmpty,
	isString: isString,
	isNumber: isNumber,
	isFunction: isFunction,
	isBuffer: isBuffer,
	assign: assign,
	inherits: inherits,
	abstractMethod: abstractMethod,
	stringToBuffer: stringToBuffer
};
