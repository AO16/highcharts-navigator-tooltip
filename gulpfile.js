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
gulp.task('build', function () {
  gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildDir));

  gulp.src('src/styles/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(buildDir + '/styles'));

});
