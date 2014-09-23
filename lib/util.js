var chalk = require('chalk'),
	constants = require('./constants'),
	format = require('util').format,
	fs = require('fs-extra'),
	logger = require('./logger'),
	path = require('path');

var $u = chalk.underline,
	$c = chalk.cyan;

exports.addToApp = function addToApp(file) {
	var src = path.resolve(file),
		relPath = path.join('__modules', src.replace(/^\//, '')),
		dst = path.resolve(constants.resourcesDir, path.basename(file)),
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

exports.printCommands = function printCommands(padding) {
	var pad = new Array(padding+1 || 5).join(' '),
		log = function() {
			var args = Array.prototype.slice.call(arguments);
			args[0] && (args[0] = pad + args[0]);
			console.log.apply(console, args);
		};

	log(format('%s %s %s', $c('.add'), $u('file'), $u('...')));
	log('  Add file(s) to the app');
	log('');
	log(format('%s', $c('.break')));
	log('  Abort the current multi-line statement');
	log('');
	log(format('%s', $c('.clear')));
	log('  Create a new execution context for the current REPL');
	log('');
	log(format('%s', $c('.exit')));
	log('  Exit triple');
	log('');
	log(format('%s', $c('.help')));
	log('  Shows command help while in the REPL');
	log('');
	log(format('%s <%s> [delay]', $c('.load'), $u('file')));
	log('  Load a local or remote JS file into the REPL, with optional delay in ms');
	log('');
	log(format('%s <%s>', $c('.save'), $u('file')));
	log('  Save the current REPL session JS to a file');
	log('');
};
