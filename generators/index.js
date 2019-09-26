const _ = require('lodash');
const Generator = require('yeoman-generator');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);
	}

	async prompting() {
		this.props = await this.prompt([
			{
				type: "input",
				name: "projectName",
				message: "Nom du projet (ex: GR1234-nom-du-projet)",
				validate: (input) => {
					return Boolean(input);
				}
			}
		]);
		console.log(this.props);
	}

	writing() {
		let tplFiles = [
			'package.json',
			'gulpfile.js',
			'deploy.sh',
		];

		let excluded = [
			'.DS_Store',
			'package-lock.json',
		];

		this.fs.copy(
			this.templatePath('**/*'),
			this.destinationPath(''),
			{
				globOptions: {
					dot: true,
					ignore: [
						...tplFiles,
						...excluded
					]
				},
			},
		);

		tplFiles.forEach(path => {
			this.fs.copyTpl(
				this.templatePath(path),
				this.destinationPath(path),
				{
					projectName: _.kebabCase(this.props.projectName),
				}
			);
		});

		mkdirp.sync('source');
		mkdirp.sync('minified');
		mkdirp.sync('bundle');

		this.installDependencies();
	}
}