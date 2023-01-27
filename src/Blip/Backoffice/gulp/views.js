import gulp from 'gulp';
import { paths } from './config';

export function views() {
    return gulp.src(paths.views)
        .pipe(gulp.dest(paths.dest));
}
