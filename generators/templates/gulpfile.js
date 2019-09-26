const { series, parallel, src, dest, watch } = require('gulp');
const glob = require('glob');
const merge = require('merge-stream');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const imagemin = require('gulp-imagemin');
const del = require('del');
const flatten = require('gulp-flatten')
const zip = require('gulp-zip');
const livereload = require('gulp-livereload');

sass.compiler = require('node-sass');

const SASS_PATH = 'source/**/*.scss';
const JS_PATH = 'source/**/*.js';
const HTML_PATH = 'source/**/index.html';
const IMG_PATH = 'source/**/*.@(png|jpg|gif|svg)';

function clean() {
	return del('minified/*');
}

function javascript() {
	return src(JS_PATH)
		.pipe(babel())
		.pipe(uglify())
		.pipe(dest('minified/'));
}

function copylibs() {
	const destinationFolders = glob.sync('minified/**/js/');

	let stream = src('node_modules/html5_banner/dist/lib.min.js');

	destinationFolders.forEach((folder) => {
		stream = stream.pipe(dest(folder));
	});

	return stream;
}

function css(cb) {
	var plugins = [
		autoprefixer(),
		cssnano()
	];
	return src(SASS_PATH)
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(plugins))
		.pipe(dest('minified/'))
		.pipe(dest('source/'));
}

function images() {
	return src(IMG_PATH)
		.pipe(imagemin([
			imagemin.gifsicle(),
			imagemin.jpegtran(),
			imagemin.optipng(),
			imagemin.svgo()
		], { verbose: true }))
		.pipe(dest('minified/'));
}

function copyhtml() {
	return src(HTML_PATH)
		.pipe(dest('minified/'));
}

function bundle() {
	const destinationFolders = glob.sync('minified/*/*');
	const streams = [];

	destinationFolders.forEach(folder => {
		const name = folder.split('/').pop() + '.zip';
		streams.push(
			src(folder + '/*')
				.pipe(zip(name))
				.pipe(dest('bundled/'))
		);
	});

	return merge(streams);
}

function reload() {
	livereload.reload();
	return Promise.resolve();
}

exports.watch = () => {
	livereload.listen();
	watch('source/**/*.@(scss|js|png|jpg|gif|svg|html)', { ignoreInitial: false }, 
		series(
			clean,
			copylibs,
			series(css, javascript, reload),
			parallel(images, copyhtml),
		)
	);
}

exports.bundle = bundle;