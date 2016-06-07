'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var gulp = require('gulp');


var getSalt = function (len) {
	len = len || 20;
	var set = '0123456789ABCDEFGHIJKLMNOPQURSTUVWXYZ -!$%?&*()=_+|£¢@{}[];:',
		setLen = set.length,
		salt = '';
	for (var i = 0; i < len; i++) {
		var p = Math.floor(Math.random() * setLen);
		salt += set[p];
	}
	return salt;
}

var LagrangeGenerator = yeoman.generators.Base.extend({
	init: function () {
		this.pkg = require('../package.json');

		this.on('end', function () {
			if (!this.options['skip-install']) {
				this.installDependencies({
					callback: function () {
						this.spawnCommandSync('gulp', ['libcopy', '--folder', this.props.projectName + '/en_' + this.props.width + 'x' + this.props.height + '_' + this.props.nomBanniere]);
					}.bind(this)
				});
			}
		});
	},

	askFor: function () {
		var done = this.async();

		// have Yeoman greet the user
		// this.log(this.yeoman);
		this.log(chalk.yellow(
		'          _ _,---._ \n       ,-\',\'       `-.___ \n      /-;\'               `._ \n     /\\/          ._   _,\'o \\ \n    ( /\\       _,--\'\\,\',\'"`. ) \n     |\\      ,\'o     \\\'    //\\ \n     |      \\        /   ,--\'""`-. \n     :       \\_    _/ ,-\'         `-._ \n      \\        `--\'  /                ) \n       `.  \\`._    ,\'     ________,\',\' \n         .--`     ,\'  ,--` __\\___,;\' \n          \\`.,-- ,\' ,`_)--\'  /`.,\' \n           \\( ;  | | )      (`-/ \n             `--\'| |)       |-/ \n               | | |        | | \n               | | |,.,-.   | |_ \n               | `./ /   )---`  ) \n              _|  /    ,\',   ,-\' \n     -hrr-   ,\'|_(    /-<._,\' |--, \n             |    `--\'---.     \\/ \\ \n             |          / \\    /\\  \\ \n           ,-^---._     |  \\  /  \\  \\ \n        ,-\'        \\----\'   \\/    \\--`. \n       /            \\              \\   \\ '
		));

		// replace it with a short and sweet description of your generator
		this.log(chalk.red('On a eu un nouveau projet sur c\'tes affaire-là d\'internet. Savez-vous ce qu\'on va faire avec c\'te 400 piasses-là?'));

		//console.log(this);

		var getDefaultFromPrevious = function(propName) {
			return function(answers){
				return answers[propName];
			}
		};

		var prompts = [
			{
				name: 'projectName',
				type: 'input',
				message: 'Nom du dossier',
				default : this.appname,
			},
			{
				name: 'width',
				type: 'input',
				message: 'Width',
				default : 300,
			},
			{
				name: 'height',
				type: 'input',
				message: 'Height',
				default : 250,
			},
			{
				name: 'nomBanniere',
				type: 'input',
				message: 'Nom de la bannière',
				default : 'client_concept',
			}
		];

		this.prompt(prompts, function (answers) {
			this.props = answers;
			function hasFeature(feat) { return features.indexOf(feat) !== -1; }

			this.props.projectNamespace = this._.camelize(this.props.projectName);
			done();
		}.bind(this));
	},

	app: function () {
		this.template('_package.json', 'package.json');
		this.template('_gulpfile.js', 'gulpfile.js');
		this.template('_.gitignore', '.gitignore');
		this.mkdir('html');

		this.mkdir('html/' + this.props.projectName);
		this.mkdir('html/' + this.props.projectName + '/en_' + this.props.width + 'x' + this.props.height + '_' + this.props.nomBanniere );

		function copyDefault(ctx, basepath) {
			ctx.template('default/index.html', basepath + '/index.html');
			ctx.template('default/script.js', basepath + '/script.js');
			ctx.template('default/styles.scss', basepath + '/styles.scss');
			ctx.template('default/spritesheet.scss', basepath + '/spritesheet.scss');
			ctx.mkdir(basepath + '/spritesheet_src');
		}

		// this.directory('default', );
		copyDefault(this, 'default');
		copyDefault(this, 'html/' + this.props.projectName + '/en_' + this.props.width + 'x' + this.props.height + '_' + this.props.nomBanniere);
	},
});

module.exports = LagrangeGenerator;
