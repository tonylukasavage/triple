var chalk = require('chalk'),
	constants = require('./constants'),
	fs = require('fs-extra'),
	path = require('path');

var error = chalk.bold.error;

exports.addToApp = function addToApp(file) {
	var src = path.resolve(file),
		dst = path.resolve(constants.resourcesDir, file);

	// make sure source file exists
	if (!fs.existsSync(src)) {
		console.error(error('file does not exist: "' + src + '"'));
		return;
	}

	// copy, or show error if it fails
	try {
		fs.ensureDirSync(path.dirname(dst));
		console.log(src + ' --> ' + dst);
		fs.copySync(src, dst);
	} catch (e) {
		console.error(error('Failed to copy file to app: "' + src + '"'));
		return;
	}
};
