export function assert(condition, errorMessage) {
	if (!condition) {
		throw new Error(errorMessage);
	}
}

export function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}
