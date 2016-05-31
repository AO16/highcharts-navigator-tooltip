/* eslint-env node, amd */
/* eslint no-var: "off" */
/* eslint prefer-template: "off" */

var path = require('path');
var gulpRequireTasks = require('gulp-require-tasks');

gulpRequireTasks({
  path: path.join(__dirname, '/node_modules/ao-gulp-tasks/tasks'),
  passGulp: true
});
