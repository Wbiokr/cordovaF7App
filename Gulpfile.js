'use strict';

var gulp = require("gulp"),
    gutil = require("gulp-util"),
    source = require("vinyl-source-stream"),
    sass = require("gulp-sass"),
    gls = require('gulp-live-server'),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon');

/*
  TASKS
 */
gulp.task('stylesheets', function () {
  return gulp.src('./www/styles/css/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./www/styles/css'));
});

gulp.task('browser-sync', ['nodemon'], function() {
  browserSync.init(null, {
    proxy: "http://localhost:4001",
    files: ["www/**/*.*"],
    browser: "google chrome",
    port: 7000,
  });
});

gulp.task('nodemon', function (cb) {

  var started = false;

  return nodemon({
    script: 'app.js'
  }).on('start', function () {
    // to avoid nodemon being started multiple times
    // thanks @matthisk
    if (!started) {
      cb();
      started = true;
    }
  });
});

gulp.task('default', ['browser-sync', 'stylesheets'], function() {
  gulp.watch('./www/**/*.sass', ['stylesheets']);
});
