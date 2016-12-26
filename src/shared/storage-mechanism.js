'use strict';

/**
 * @fileoverview Abstract interface for storing and retrieving data using
 * some persistence mechanism.
 * */

var abstractMethod = require('./utils').abstractMethod;

/**
 * Interface for all async storage mechanisms.
 *
 * @constuctor
 * */
function StorageMechanism () {}

/**
 * Sets a value for a key.
 *
 * @param {string} key The key to set
 * @param {string} value Value to save.
 * */
StorageMechanism.prototype.set = abstractMethod;

/**
 * Gets the value stored under key.
 *
 * @param {string} key The key to get.
 * @return {string} The correspondent value
 * 		or null if not found.
 * */
StorageMechanism.prototype.get = abstractMethod;

/**
 * Removes a key and its value.
 * @param {string} key Key to remove.
 * */
StorageMechanism.prototype.remove = abstractMethod;

module.exports = StorageMechanism;

