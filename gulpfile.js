var gulp    = require('gulp');
var coffee  = require('gulp-coffee');
var plumber = require('gulp-plumber');
var notify  = require('gulp-notify');
var compass = require('gulp-compass');
var gettext = require('gulp-gettext');

gulp.task('coffee', function(){
    gulp.src('./js/*.coffee')
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(coffee({bare:false}))
        .pipe(gulp.dest('./js/'));
});

gulp.task('sass', function(){
    gulp.src('./css/*.scss')
        // .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(compass({
            config_file: './config.rb',
            css: 'css',
            sass: 'css'
        }))
        .pipe(gulp.dest('./css/'));
});

gulp.task('gettext', function(){
    gulp.src('./languages/*.po')
        .pipe(gettext())
        .pipe(gulp.dest('./languages/'));
});

gulp.task('build',['coffee','sass', 'gettext']);

gulp.task('watch', ['build'], function(){
    gulp.watch(['./js/*.coffee','./css/*.scss','./languages/*.po'], ['build']);
});
