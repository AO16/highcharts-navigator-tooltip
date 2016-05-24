/* eslint-env node, amd */
/* eslint no-var: "off" */
/* eslint prefer-template: "off" */

var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');

var buildDir = 'dist';
var buildStylesDir = buildDir + '/styles';

var srcDir = 'src';
var srcStyles = srcDir + '/styles/*.sass';
var srcScripts = srcDir + '/**/*.js';

gulp.task('build-styles', function() {
  var stream = gulp.src(srcStyles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(buildStylesDir));

  return stream;
});

gulp.task('build-scripts', function() {
  var stream = gulp.src(srcScripts)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildDir));

  return stream;
});

gulp.task('build', ['build-scripts', 'build-styles']);

gulp.task('watch', function() {
  gulp.watch(srcScripts, ['build-scripts']);
  gulp.watch(srcStyles, ['build-styles']);
});

gulp.task('default', ['watch']);
