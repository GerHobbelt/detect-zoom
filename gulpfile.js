'use strict';

var
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify'),

  dist = 'dist/';

gulp.task('default', function() {
  return gulp.src('src/detect-zoom.js')
    .pipe(gulp.dest(dist))
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(dist))
});
