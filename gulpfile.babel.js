import 'babel-core/external-helpers';

import gulp from 'gulp';
import './devops/tasks/clean';
import './devops/tasks/build';

gulp.task('default', ['build']);
