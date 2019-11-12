/* eslint-disable @typescript-eslint/typedef */
const gulp = require('gulp');
const typescript = require('gulp-typescript');
const eslint = require('gulp-eslint');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

const project = typescript.createProject('tsconfig.json');

gulp.task('lint', () =>
	gulp.src('src/**/*.ts')
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError()));

gulp.task('build', () =>
{
	del.sync(['bin/**/*.*']);
	const tsCompile = gulp.src('src/**/*.ts')
		.pipe(sourcemaps.init({ base: 'src' }))
		.pipe(project());

	tsCompile.pipe(gulp.dest('bin/'));

	gulp.src('src/**/*.js').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.json').pipe(gulp.dest('bin/'));
	gulp.src('src/**/*.lang').pipe(gulp.dest('bin/'));

	return tsCompile.js
		.pipe(sourcemaps.write('.', { sourceRoot: '../src' }))
		.pipe(gulp.dest('bin/'));
});

// Should only be run in a GH workflow
gulp.task('gh-docs-prepare', cb =>
{
	del.sync([
		'../gh-pages/**/*.*',
		'../gh-pages/.*',
		'!../gh-pages',
		'!../gh-pages/.git',
		'!../gh-pages/.git/**'
	], { force: true });

	gulp
		.src('../docs/**/*.*')
		.pipe(gulp.dest('../gh-pages'));

	return cb();
});

gulp.task('default', gulp.series('lint', 'build'));
