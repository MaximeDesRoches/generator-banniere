var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var bundleFolder = 'bundled';
var packageFolder = '';
var fs = require("fs");
var bannersFolder = 'html';
var formatRegex = /^(en|fr)?_?([\d]+x[\d]+)_?(.*)/i;
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var spritesmith = require('gulp.spritesmith');
var gutil = require('gulp-util');
var argv = require('yargs').argv;

function generateSpritesheets(file) {
	var dest = file.path.replace(/[\/\\][\w_\-\.]+\.\w+$/, '');
	//console.log(file.path);
	//console.log(dest);
    var spriteData = gulp.src(dest + '/*')
        .pipe(spritesmith({
            imgName: 'spritesheet.png',
            cssName: 'sprites.scss'
        }));

    spriteData.img.pipe(gulp.dest(dest + '/../'));
    spriteData.css.pipe(gulp.dest(dest + '/../').on('end', function(){
		console.log('Spritesheet generated');
	}));
};



//***************************************************

function compileScss(file){
	var dest = file.path.replace(/[\/\\][a-z_\-\.]+\.scss$/, '');
	//console.log(dest)

	return gulp.src(file.path)
		// .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(gulp.dest(dest).on('end',function(){
			console.log('Sass compiled.');
		}));
}


function bundleZip(){

	try {
		fs.statSync(bundleFolder);
	} catch(e) {
		fs.mkdirSync(bundleFolder);
	}

	var zips = null;
	var bannersGroup = fs.readdirSync(bannersFolder).filter(function(f){
		return f != ".DS_Store";
	}).forEach(function(dirname){
		var banners = fs.readdirSync(bannersFolder + '/' + dirname).map(function(fname) {
			var m = fname.match(formatRegex);
			if(m) {
				return {
					lng: m[1],
					format: m[2],
					name: m[3],
					full: m[0],
				}
			}
			return false;
		}).filter(function(f){
			return f;
		}).forEach(function(cnf){
			// console.log(cnf.full);

			var base = bannersFolder + '/' + dirname + '/' + cnf.full;
			var stream = gulp.src([base + '/**', '!'+base+'/spritesheet_src/**', '!'+base+'/spritesheet_src/', '!'+base+'/**/*.scss'])
							.pipe(imagemin([pngquant()]).on('end', function(){
								gutil.log(gutil.colors.yellow("Zipping:"), dirname+'/'+cnf.full);
							}))
							.pipe(zip(cnf.full+'.zip'))
							.pipe(gulp.dest(bundleFolder+'/'+dirname));
		});
	});

	return zips;
}

//************** TASKS

gulp.task('libcopy', function(){
	var folder = argv.folder || "default";
	gulp.src('./node_modules/html5_banner/dist/lib.min.js')
		.pipe(gulp.dest('./default/'))
		.pipe(gulp.dest('./html/'+folder));
});

gulp.task('scss', compileScss);

gulp.task('watch', function () {

	gulp.watch('**/**/styles.scss').on('change', compileScss);
	gulp.watch('**/**/spritesheet_src/*.*').on('change', generateSpritesheets);

});

gulp.task('bundle', function() {
	return bundleZip();
});/**/
