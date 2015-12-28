import _ from 'lodash';
import gulp from 'gulp';
import gulpUtil from 'gulp-util';
import gulpPlumber from 'gulp-plumber';
import { handleError } from '../utils';
import webpack from 'webpack';
import vinylNamed from 'vinyl-named';
import webpackStream from 'webpack-stream';
import { WEBPACK_CLIENT } from '../config';

gulp.task('build', () => {
	return gulp.src(_.values(WEBPACK_CLIENT.entry))
		.pipe(vinylNamed())
		.pipe(gulpPlumber(handleError))
		.pipe(webpackStream(WEBPACK_CLIENT, webpack))
		.pipe(gulpPlumber.stop())
		.pipe(gulp.dest(WEBPACK_CLIENT.output.path));
});
