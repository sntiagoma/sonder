"use strict";
var gulp       = require("gulp");
var sass       = require("gulp-sass");
var uglify     = require("gulp-uglify");
var server     = require("gulp-develop-server");
var source     = require("vinyl-source-stream");
var buffer     = require("vinyl-buffer");
var browserify = require("browserify");
var Log        = require("log"), log = new Log("info");


var sassFolder    = "./client/sass/**/*.scss";
var sassDest      = "./client/css/";
var sassObjConfig = {outputStyle: 'compressed'};
var frontAppPath  = "./client/app/app.js";
var frontAppDest  = "./client/js";

gulp.task('styles',function(){
    gulp.src(sassFolder)
        .pipe(sass(sassObjConfig).on('error',log.error))
        .pipe(gulp.dest(sassDest));
    });

gulp.task('browserify', function() {  
  return browserify(frontAppPath)
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(frontAppDest));
});

gulp.task('browserify-pretty', function() {  
  return browserify(frontAppPath)
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(frontAppDest));
});

gulp.task('watch', function() {
    gulp.watch(sassFolder,['styles']);
    gulp.watch('./client/app', ['browserify']);
    return;
});

gulp.task('run', function() {
    server.listen({path:'./server/app.js'});
});

gulp.task('build', function() {
    gulp.start(['browserify','styles']);
    return;
});

gulp.task('auto',function() {
    gulp.start(['build', 'watch', 'run']);
    return;
});

gulp.task('default',function() {
    gulp.start(['build','run']);
    return;
});