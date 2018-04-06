export function getUnixTimestamp(date: Date|number): number {
	let time;
	if (typeof date === 'number') {
		time = date;
	} else {
		time = date.getTime();
	}
	return Math.floor(time / 1000);
}
