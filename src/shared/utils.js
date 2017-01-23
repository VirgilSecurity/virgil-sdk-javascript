'use strict';

var assign = require('lodash/assign');
var mapValues = require('lodash/mapValues');

function bufferToBase64 (buf) {
	return bufferToString(buf, 'base64');
}

function bufferToString(buf, encoding) {
	encoding = encoding || 'utf8';
	return buf.toString(encoding);
}

function base64ToBuffer (str) {
	return stringToBuffer(str, 'base64');
}

function stringToBuffer(str, encoding) {
	encoding = encoding || 'utf8';
	return new Buffer(str, encoding);
}

function stringToBase64(str) {
	return bufferToBase64(stringToBuffer(str));
}

function base64ToString(base64) {
	return bufferToString(base64ToBuffer(base64));
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

function isObject (obj) {
	return typeof obj === 'object';
}

function isBuffer(obj) {
	return Buffer.isBuffer(obj);
}

function assert(condition, errorMessage) {
	if (!condition) {
		throwVirgilError(errorMessage);
	}
}

function throwVirgilError(message) {
	throw new Error('Virgil Error: ' + message);
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
	isObject: isObject,
	isBuffer: isBuffer,
	assign: assign,
	mapValues: mapValues,
	inherits: inherits,
	abstractMethod: abstractMethod,
	stringToBuffer: stringToBuffer,
	base64ToBuffer: base64ToBuffer,
	bufferToString: bufferToString,
	bufferToBase64: bufferToBase64,
	base64ToString: base64ToString,
	stringToBase64: stringToBase64
};
