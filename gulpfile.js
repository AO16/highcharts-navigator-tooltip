// Dependencies
//-----------------------------------------------
var gulp = require('gulp');
var babel = require('gulp-babel');

// Configuration
//-----------------------------------------------
var buildDir = 'dist';
var buildFile = "navigator-tooltip.js";
var buildDirFile = buildDir + '/' + buildFile;

// Tasks
//-----------------------------------------------
gulp.task('build', function () {
  gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildDir));
});
