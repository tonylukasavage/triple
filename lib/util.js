var chalk = require('chalk'),
	constants = require('./constants'),
	fileServer = require('./fileServer'),
	format = require('util').format,
	fs = require('fs-extra'),
	logger = require('./logger'),
	path = require('path');

var $u = chalk.underline,
	$c = chalk.cyan,
	addCache = {};


exports.addToApp = function addToApp(file) {
	var src = path.resolve(process.cwd(), file),
		platform = exports.platform,
		relPath = path.join('__modules', src.replace(/^\//, '')),
		filename = path.basename(file),
		dst = path.join(constants.resourcesDir, filename),
		dstModule = path.join(constants.resourcesDir, relPath),
		isJsFile = /\.(?:js|json)$/.test(dstModule),
		$cd = chalk.cyan.dim,
		$g = chalk.gray,
		details = $g('added');

	// make sure source file exists
	if (!fs.existsSync(src)) {
		logger.error('file does not exist: "' + src + '"');
		return;
	}

	if (platform === 'ios') {

		// manually copy file to ios sim folder(s)
		try {
			fs.ensureDirSync(path.dirname(dst));
			fs.copySync(src, dst);

			if (isJsFile) {
				fs.ensureDirSync(path.dirname(dstModule));
				fs.copySync(src, dstModule);
			}
		} catch (e) {
			logger.error('Failed to copy file to app: "' + src + '"');
			return;
		}
	} else {

		// tell file server to transfer the file
		fileServer.emit('file', createFileBuffer(src, dst));
		details = format('%s %s%s %s', $g('added as'), $cd(constants.resourcesDir + filename),
			$g(', or shorthand'), $cd('$F(\'' + filename + '\')'));
	}

	addCache[src] = true;
	logger.system('%s %s', $cd(filename), details);
};

function createFileBuffer(src, dst) {
	var file = fs.readFileSync(src),
		fileLen = file.length,
		filepath = dst,
		filepathLen = dst.length;

	var buffer = new Buffer(4 + 4 + filepathLen + 4);
	buffer.writeInt32LE(4 + 4 + filepathLen + 4 + fileLen, 0);
	buffer.writeInt32LE(filepathLen, 4);
	buffer.write(filepath, 4 + 4, filepathLen);
	buffer.writeInt32LE(fileLen, 4 + 4 + filepathLen);

	return Buffer.concat([buffer, file]);
}

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
