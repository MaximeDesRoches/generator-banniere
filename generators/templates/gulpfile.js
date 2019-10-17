const pkg = require('./package.json');
const gutil = require('gulp-util');
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
const rename = require('gulp-rename');
const del = require('del');
const flatten = require('gulp-flatten')
const zip = require('gulp-zip');
const livereload = require('gulp-livereload');

sass.compiler = require('node-sass');

const SASS_PATH = 'source/**/*.scss';
const JS_PATH = 'source/**/script.js';
const IMG_PATH = 'source/**/*.@(png|jpg|gif|svg)';
const COPY_PATH = ['source/**/*.@(html|css|png|jpg|gif|svg)', 'source/**/*.min.js'];

function clean() {
	return del('minified');
}

function javascript() {
	return src(JS_PATH)
		.pipe(babel())
		.pipe(uglify())
		.pipe(rename((path) => {
			path.extname = '.min.js';
		}))
		.pipe(dest('source/'));
}

function copylibs() {
	const destinationFolders = glob.sync('source/**/js/');

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
		.pipe(rename((path) => {
			path.extname = '.min.css';
		}))
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
	return src(COPY_PATH)
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

function string_src(filename, string) {
	var src = require('stream').Readable({ objectMode: true });
	src._read = function () {
		this.push(new gutil.File({
			cwd: "",
			base: "",
			path: filename,
			contents: new Buffer.from(string)
		}));
		this.push(null);
	}
	return src;
}

exports.watch = function() {
	livereload.listen();
	watch(['source/**/*.@(scss|png|jpg|gif|svg|html)', 'source/**/script.js'], { ignoreInitial: false }, 
		series(
			copylibs,
			series(css, javascript, reload),
		)
	);
}

exports.build = series(
	copylibs,
	series(css, javascript),
	copyhtml,
);

exports.images = () => {
	return images();
}

exports.enclos = () => {
	const destinationFolders = glob.sync('minified/*/*');
	
	const content = destinationFolders.reduce((c, folder) => {
		c += folder.replace('minified/', 'http://clients.enclos.ca/richmedia/' + pkg.name + '/') + '\n';
		return c;
	}, '');

	return string_src('liens_enclos.txt', content)
				.pipe(dest('.'))
}

exports.bundle = series(exports.build, bundle, clean);