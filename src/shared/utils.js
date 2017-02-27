'use strict';

var assign = require('lodash/assign');
var mapValues = require('lodash/mapValues');
var isEmpty = require('lodash/isEmpty');
var isBuffer = require('is-buffer');
var isArrayBuffer = require('lodash/isArrayBuffer');
var VirgilError = require('../errors/virgil-error');

function isString(obj) {
	return typeof obj === 'string';
}

function isFunction(obj) {
	return typeof obj === 'function';
}

function isNumber(obj) {
	return typeof obj === 'number';
}

function isObject(obj) {
	return typeof obj === 'object';
}

function isArray(obj) {
	return Array.isArray(obj);
}

function isUndefined(obj) {
	return typeof obj === 'undefined';
}

function assert(condition, errorMessage) {
	if (!condition) {
		throw createError(errorMessage);
	}
}

function createError(message, props) {
	var error = new VirgilError(message);
	if (isObject(props)) {
		assign(error, props);
	}

	return error;
}

function abstractMethod () {
	throw new Error('This method should be overridden by derived class.');
}

function base64Encode (input, inputEncoding) {
	if (!(isString(input) || isBuffer(input))) {
		throw createError('Cannot encode ' + typeof input +
			'. Value must be a string or Buffer.');
	}

	var buffer = isBuffer(input) ? input
		: (Buffer.isEncoding(inputEncoding) ? new Buffer(input, inputEncoding)
			: new Buffer(input));

	return buffer.toString('base64');
}

function base64Decode (input, outputEncoding) {
	if (!isString(input)) {
		throw createError('Cannot decode ' + typeof input +
			'. Value must be a string.')
	}

	var buffer = new Buffer(input, 'base64');
	return Buffer.isEncoding(outputEncoding) ?
		buffer.toString(outputEncoding) : buffer;
}

function toArray(obj) {
	return Array.isArray(obj) ? obj : (obj ? [obj] : obj);
}

function stringToBuffer(str, encoding) {
	encoding = encoding || 'utf8';
	return new Buffer(str, encoding);
}

function arrayBufferToBuffer(arrayBuf) {
	return new Buffer(new Uint8Array(arrayBuf));
}

module.exports = {
	assert: assert,
	createError: createError,
	isEmpty: isEmpty,
	isString: isString,
	isNumber: isNumber,
	isFunction: isFunction,
	isObject: isObject,
	isArray: isArray,
	isUndefined: isUndefined,
	isBuffer: isBuffer,
	isArrayBuffer: isArrayBuffer,
	assign: assign,
	mapValues: mapValues,
	abstractMethod: abstractMethod,
	stringToBuffer: stringToBuffer,
	base64Encode: base64Encode,
	base64Decode: base64Decode,
	arrayBufferToBuffer: arrayBufferToBuffer,
	toArray: toArray
};
