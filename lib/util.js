var constants = require('./constants'),
	fs = require('fs-extra'),
	logger = require('./logger'),
	path = require('path');

exports.addToApp = function addToApp(file, cachebuster) {

	var src = path.resolve(file), relPath, dst, dstModule;

	if (cachebuster) {
		relPath = path.join('__modules', src.replace('.js','_'+ cachebuster + ".js").replace(/^\//, ''));
		dst = path.resolve(constants.resourcesDir, path.basename(file.replace('.js','_'+ cachebuster + ".js")));
	} else {
		relPath = path.join('__modules', src.replace(/^\//, ''));
		dst = path.resolve(constants.resourcesDir, path.basename(file));
	}

	dstModule = path.resolve(constants.resourcesDir, relPath);

	// make sure source file exists
	if (!fs.existsSync(src)) {
		logger.error('file does not exist: "' + src + '"');
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
		logger.error('Failed to copy file to app: "' + src + '"');
		return;
	}
};
