// Dependencies
//-----------------------------------------------
var gulp = require('gulp');
var babel = require('gulp-babel');
var sass = require('gulp-sass');

// Configuration
//-----------------------------------------------
var buildDir = 'dist';

// Tasks
//-----------------------------------------------
gulp.task('build-styles', function() {
  var stream = gulp.src('src/styles/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(buildDir + '/styles'));

  return stream;
});

gulp.task('build-scripts', function() {
  var stream = gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildDir));

  return stream;
});

gulp.task('build', ['build-scripts', 'build-styles']);

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['build-scripts']);
  gulp.watch('src/styles/*.sass', ['build-styles']);
});

gulp.task('default', ['watch']);
