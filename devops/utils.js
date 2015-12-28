import gulpNotify from 'gulp-notify';

export function handleError (...args) {
	gulpNotify.onError({ title: 'COMPILE ERROR:', message: '<%= error %>' })(...args);
	this.emit('end');
}
