/* eslint-disable @typescript-eslint/typedef */

const { Application } = require('typedoc');

const app = new Application({
	target: 'es2017',
	mode: 'file',
	module: 'commonjs',
	theme: 'node_modules/@discord-sambo/typedoc-themes/bin/minimal',
	exclude: './**/+(node_modules|__test__|)/**/*.ts',
	out: '../docs'
});

const project = app.convert(app.expandInputFiles(['src']));

if (typeof project !== 'undefined')
{
	const outputDir = app.options.getValue('out');

	app.options.addDeclaration({ name: 'links', type: 'Array' });
	app.options.setValue(
		'links',
		[
			{
				label: 'Command',
				url: 'https://discord-sambo.github.io/command/docs',
				current: true
			},
			{
				label: 'Localization',
				url: 'https://discord-sambo.github.io/localization/docs',
				current: false
			},
			{
				label: 'Logger',
				url: 'https://discord-sambo.github.io/logger/docs',
				current: false
			}
		]
	);

	app.generateDocs(project, outputDir);
}
