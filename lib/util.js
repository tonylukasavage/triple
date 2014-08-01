var chalk = require('chalk'),
	constants = require('./constants'),
	fs = require('fs-extra'),
	path = require('path');

var error = chalk.bold.red;

exports.addToApp = function addToApp(file) {
	var src = path.resolve(file),
		relPath = path.join('__modules', src.replace(/^\//, '')),
		dst = path.resolve(constants.resourcesDir, path.basename(file)),
		dstModule = path.resolve(constants.resourcesDir, relPath);

	// make sure source file exists
	if (!fs.existsSync(src)) {
		console.error(error('file does not exist: "' + src + '"'));
		return;
	}

	// copy, or show error if it fails
	try {
		fs.ensureDirSync(path.dirname(dst));
		fs.copySync(src, dst);

		if (/\.(?:js|json)$/.test(dstModule)) {
			fs.ensureDirSync(path.dirname(dstModule));
			fs.copySync(src, dstModule);
		}
	} catch (e) {
		console.error(error('Failed to copy file to app: "' + src + '"'));
		return;
	}
};
