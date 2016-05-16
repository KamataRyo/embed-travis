var gulp    = require('gulp');
var coffee  = require('gulp-coffee');
var plumber = require('gulp-plumber');
var notify  = require('gulp-notify');
var gettext = require('gulp-gettext');

gulp.task('coffee', function(){
    gulp.src('./js/*.coffee')
        .pipe(plumber({errorHandler: notify.onError('<%= error.message %>')}))
        .pipe(coffee({bare:false}))
        .pipe(gulp.dest('./js/'));
});

gulp.task('gettext', function(){
    gulp.src('./languages/*.po')
        .pipe(gettext())
        .pipe(gulp.dest('./languages/'));
});

gulp.task('build',['coffee', 'gettext']);

gulp.task('watch', ['build'], function(){
    gulp.watch(['./js/*.coffee', './languages/*.po'], ['build']);
});
