var gulp = require('gulp');
var path = require('path');
var del = require('del');
var $ = require('gulp-load-plugins')({
  pattern: '*',
});

var environment = $.util.env.type || 'development';
var isProduction = environment === 'production';
var webpackConfig = require('./webpack.config.js')[environment];

var src = 'src/';
var dist = 'dist/';

gulp.task('scripts', function() {
  return gulp.src(webpackConfig.entry)
    .pipe($.webpackStream(webpackConfig))
    .pipe(isProduction ? $.uglifyjs() : $.util.noop())
    .pipe(gulp.dest(dist + 'js/'))
    .pipe($.size({ title : 'js' }))
    .pipe($.connect.reload());
});

gulp.task('watch', function() {
  gulp.watch([src + '/app.js', src + '/**/*.js', src + 'app/**/*.hbs'], ['scripts']);
});

gulp.task('clean', function(cb) {
  del([dist], cb);
});

// by default build project and then watch files in order to trigger livereload
gulp.task('default', ['build', 'watch']);

// waits until clean is finished then builds the project
gulp.task('build', ['clean'], function(){
  gulp.start(['scripts']);
});
