var assign = require('../shared/utils').assign;

function signableRequest () {
	var snapshot;
	var signatures;

	var methods = {
		getSnapshot: getSnapshot,
		appendSignature: appendSignature,
		getSignature: getSignature,
		getRequestModel: getRequestModel,
		export: exportRequest
	};

	return {
		init: function init (params) {
			snapshot = new Buffer(JSON.stringify(params));
			signatures = Object.create(null);

			return assign({}, params, methods);
		},
		restore: function restore (contentSnapshot, signs) {
			snapshot = new Buffer(contentSnapshot, 'base64');
			signatures = Object.keys(signs)
				.reduce(function (result, key) {
					result[key] = new Buffer(signs[key], 'base64');
					return result;
				}, {});

			var params = JSON.parse(snapshot.toString('utf8'));
			return assign({}, params, methods);
		}
	};

	/**
	 * Returns the snapshot of the request
	 * */
	function getSnapshot() {
		return snapshot;
	}

	/**
	 * Appends a signature to the request
	 *
	 * @param {string} signerId - Id of signer
	 * @param {Buffer} signature - Signature value
	 * */
	function appendSignature(signerId, signature) {
		signatures[signerId] = signature;
	}

	/**
	 * Returns a signature by signer Id
	 *
	 * @param {string} signerId - Id of signer
	 * @returns {string} The signature
	 * */
	function getSignature(signerId) {
		return signatures[signerId];
	}

	/**
	 * Returns serializable representation of the request
	 *
	 * @returns {Object}
	 * */
	function getRequestModel() {
		return {
			content_snapshot: snapshot.toString('base64'),
			meta: {
				signs: Object.keys(signatures)
					.reduce(function (result, key) {
						result[key] = signatures[key].toString('base64');
						return result;
					}, {})
			}
		}
	}

	/**
	 * Exports request to base64-encoded string
	 * */
	function exportRequest() {
		var json = JSON.stringify(getRequestModel());
		var buf = new Buffer(json);
		return buf.toString('base64');
	}
}

function signableRequestCreate (params) {
	return signableRequest().init(params);
}

function signableRequestImport (exportedRequest) {
	var json = new Buffer(exportedRequest, 'base64');
	var requestModel = JSON.parse(json.toString('utf8'));
	return signableRequest().restore(requestModel.content_snapshot, requestModel.meta.signs);
}

module.exports = {
	signableRequest: signableRequestCreate,
	signableRequestImport: signableRequestImport
};
