function assert(condition, errorMessage) {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

module.exports = {
	assert: assert,
	isEmpty: isEmpty
};
