var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var bundleFolder = 'bundled';
var packageFolder = '';
var fs = require("fs");
var bannersFolder = 'html';
var formatRegex = /^(.*?)_(.*?)_([0-9]+)x([0-9]+)_(.*?)_?/i;
var zip = require('gulp-zip');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var spritesmith = require('gulp.spritesmith');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var livereload = require('gulp-livereload');

// function generateSpritesheets(file) {
// 	var dest = file.path.replace(/[\/\\][\w_\-\.]+\.\w+$/, '');
// 	//console.log(file.path);
// 	//console.log(dest);
//     var spriteData = gulp.src(dest + '/*')
//         .pipe(spritesmith({
//             imgName: 'spritesheet.png',
//             cssName: 'sprites.scss'
//         }));

//     spriteData.img.pipe(gulp.dest(dest + '/../'));
//     spriteData.css.pipe(gulp.dest(dest + '/../').on('end', function(){
// 		console.log('Spritesheet generated');
// 	})).pipe(livereload());
// };



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
		}))
		.pipe(livereload());
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
		var banners = fs.readdirSync(bannersFolder + '/' + dirname)
		.filter(function(f){
			return formatRegex.exec(f);
		}).forEach(function(cnf){
			var base = bannersFolder + '/' + dirname + '/' + cnf;
			var stream = gulp.src([base + '/**', '!'+base+'/spritesheet_src/**', '!'+base+'/spritesheet_src/', '!'+base+'/**/*.scss'])
							.pipe(imagemin([pngquant()]).on('end', function(){
								gutil.log(gutil.colors.yellow("Zipping:"), dirname+'/'+cnf);
							}))
							.pipe(zip(cnf+'.zip'))
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
	livereload.listen();

	gulp.watch('**/**/styles.scss').on('change', compileScss);
	// gulp.watch('**/**/spritesheet_src/*.*').on('change', generateSpritesheets);

});

gulp.task('bundle', function() {
	return bundleZip();
});/**/
