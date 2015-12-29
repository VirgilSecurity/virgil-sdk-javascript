import gulp from 'gulp';
import del from 'del';
import { PATHS } from '../config';

gulp.task('clean:build', (cb) => {
	del([PATHS.build], cb);
});

gulp.task('clean', ['clean:build']);
