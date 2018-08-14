/**
 * Converts javascript date object or timestamp in milliseconds
 * to Unix timestamp.
 *
 * @hidden
 *
 * @param {Date | number} date - The date or timestamp to convert.
 * @returns {number}
 */
export function getUnixTimestamp(date: Date|number): number {
	let time;
	if (typeof date === 'number') {
		time = date;
	} else {
		time = date.getTime();
	}
	return Math.floor(time / 1000);
}

/**
 * Adds the given number of seconds to the given date.
 *
 * @hidden
 *
 * @param {Date | number} date - The date to add seconds to.
 * If `date` is a `number` it is treated as a timestamp in milliseconds.
 * @param {number} seconds - The number of seconds to add.
 * @returns {Date} - The new date.
 */
export function addSeconds (date: Date|number, seconds: number): Date {
	if (typeof date === 'number') {
		return new Date(date + seconds * 1000);
	}

	return new Date(date.getTime() + seconds * 1000);
}
