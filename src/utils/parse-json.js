module.exports = function parseJSON (input) {
	try {
		return JSON.parse(input);
	} catch (e) {
		return input;
	}
}
