'use strict';

var assign = require('lodash/assign');
var mapValues = require('lodash/mapValues');
var isEmpty = require('lodash/isEmpty');
var isArrayBuffer = require('lodash/isArrayBuffer');
var VirgilError = require('../errors/virgil-error');

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

function isBuffer(obj) {
	return Buffer.isBuffer(obj);
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
	isBuffer: isBuffer,
	isArrayBuffer: isArrayBuffer,
	assign: assign,
	mapValues: mapValues,
	abstractMethod: abstractMethod,
	stringToBuffer: stringToBuffer,
	base64ToBuffer: base64ToBuffer,
	bufferToString: bufferToString,
	bufferToBase64: bufferToBase64,
	base64ToString: base64ToString,
	stringToBase64: stringToBase64,
	arrayBufferToBuffer: arrayBufferToBuffer
};
