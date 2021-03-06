"use strict";
var gulp       = require("gulp"),
    sass       = require("gulp-sass"),
    uglify     = require("gulp-uglify"),
    server     = require("gulp-develop-server"),
    source     = require("vinyl-source-stream"),
    buffer     = require("vinyl-buffer"),
    browserify = require("browserify"),
    livereload = require('gulp-livereload'),
    Log        = require("log"), log = new Log("info");

//Options
var sassFolder    = "./client/sass/**/*.scss",
    sassDest      = "./client/css/",
    sassObjConfig = {outputStyle: 'compressed'},
    frontAppPath  = "./client/app/app.js",
    frontAppDest  = "./client/js",
    serverFiles = [
        './server/*.js',
        './server/**/*.js',
        './server/**/**/*.js'
    ],
    clientFiles = [
        "./client/*.js",
        "./client/**/*.js",
        "./client/**/**/*.js",
        "./client/**/**/**/*.js",
    ];

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
    .pipe(gulp.dest(frontAppDest));
});

gulp.task('watch', function() {
    gulp.watch(sassFolder,['styles']);
    gulp.watch('./client/app', ['browserify']);
});

gulp.task('run', function() {
    server.listen({path:'./server/app.js'} , livereload.listen);
});

gulp.task('build', function() {
    gulp.start(['browserify','styles']);
});

gulp.task('default',function() {
    gulp.start(['build','run']);
});

gulp.task('live',['build','run'], function() {
    function restart( file ) {
        server.changed( function( error ) {
            if(!error) livereload.changed( file.path );
        });
    }
    gulp.watch(serverFiles).on('change', restart);
    gulp.watch(sassFolder, ["styles"]);
    gulp.watch( clientFiles, ["browserify"]);
});
