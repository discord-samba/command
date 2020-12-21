/* eslint-disable @typescript-eslint/typedef */
const Glob = require('glob');
const Path = require('path');
const FS = require('fs');

// Copy non-ts files from src/ to bin/
const nonTSFiles = Glob.sync(Path.join(__dirname, '../src/**/*.!(ts)'));
for (const file of nonTSFiles)
{
	const newFile = file.replace(
		Path.join(__dirname, '../src'),
		Path.join(__dirname, '../bin')
	);

	const newDir = newFile.match(/(.+)\//)[1];
	FS.mkdirSync(newDir, { recursive: true });
	FS.copyFileSync(file, newFile);
}
