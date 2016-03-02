const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mocha = require('gulp-mocha');

require('babel-core/register');


function clean() {
  return del('dist');
}

function test() {
  return gulp.src('test/**/*.js', {read: false})
    .pipe(mocha());
}

function compileJs() {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
}

function copyOther() {
  return gulp.src('src/**/*.!(js)')
    .pipe(gulp.dest('dist'));
}

gulp.task('test', test);
gulp.task('compile', gulp.series(clean, compileJs, copyOther));

