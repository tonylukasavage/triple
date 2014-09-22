var _ = require('lodash'),
	constants = require('./constants'),
	exec = require('child_process').exec,
	path = require('path'),
	spawn = require('child_process').spawn,
	util = require('util');

exports.verbose = false;

var TITANIUM = path.join(__dirname, '..', 'node_modules', '.bin', 'titanium'),
	GLOBAL_FLAGS = {
		noBanner: true,
		noProgressBars: true,
		noPrompt: true
	},
	DEFAULTS = {
		build: _.extend({
			projectDir: '.',
			platform: process.platform === 'darwin' ? 'ios' : 'android',
			logLevel: 'info'
		}, GLOBAL_FLAGS),
		create: _.extend({
			workspaceDir: '.',
			platforms: 'android,ios,ipad,iphone'
		}, GLOBAL_FLAGS)
	};

exports.status = function status(callback) {
	var cmd = util.format('%s status -o json', TITANIUM);
	exec(cmd, function(err, stdout, stderr) {
		if (err) { return callback(err); }
		return callback(null, JSON.parse(stdout));
	});
};

exports.loggedIn = function loggedIn(callback) {
	exports.status(function(err, results) {
		return callback(err, results && results.loggedIn === true);
	});
};

exports.sdk = function sdk(callback) {
	var cmd = util.format('%s info -t titanium -o json', TITANIUM);
	exec(cmd, function(err, stdout, stderr) {
		if (err) { return callback(err); }
		var info = JSON.parse(stdout),
			version = info.titaniumCLI.selectedSDK || Object.keys(info.titanium)[0],
			sdk = info.titanium[version];
		return callback(null, sdk, version, info);
	});
};

// create module interface
['build','create'].forEach(function(command) {
	exports[command] = function(opts, args, callback) {

		// create flexible function signature:
		// - runner(command, callback)
		// - runner(command, opts, callback)
		// - runner(command, opts, args, callback)
		callback = maybeCallback(arguments[arguments.length-1]);
		if (!opts || _.isFunction(opts)) {
			opts = {};
		}
		if (!args || _.isFunction(args)) {
			args = [];
		}

		return runner(command, opts, args, callback);
	};
});

function runner(command, opts, args, callback) {

	// validate the command
	if (!exports[command]) {
		return callback(new Error('invalid command "' + command + '"'));
	}

	// set opts based on defaults
	opts = _.defaults(opts, _.extend(DEFAULTS[command], GLOBAL_FLAGS));

	// execute titanium command
	var preppedArgs = getArgsForCommand(command, opts, args),
		showOutput = false,
		out = '', err = '';

	var ti = spawn(TITANIUM, preppedArgs);
	ti.stdout.on('data', function(data) {
		out += data.toString();
		if (exports.verbose) {
			process.stdout.write(data.toString());
		}
	});
	ti.stderr.on('data', function(data) {
		err += data.toString();
		process.stderr.write(data.toString());
	});
	ti.on('close', function(code) {
		return callback(code ? err : null);
	});
}

function getArgsForCommand(command, opts, extraArgs) {
	opts = opts || {};
	extraArgs = extraArgs || [];
	var args = [];

  // create the list of command arguments
  Object.keys(opts).forEach(function(key) {
    var value = opts[key],
      isBool = _.isBoolean(value);
    if (!isBool || (isBool && !!value)) {
      args.push(camelCaseToDash(key));
    }
    if (!isBool) { args.push(value); }
  });
  args.unshift(command);

  // add non-option, non-flag arguments
  args = args.concat(extraArgs);

  return args;
}

function camelCaseToDash(str) {
  if (typeof str !== 'string') { return str; }
  return '--' + str.replace(/([A-Z])/g, function(m) { return '-' + m.toLowerCase(); });
}

function maybeCallback(o) {
	return o && _.isFunction(o) ? o : function(err) { if (err) {
		err.message && (err.message += '\n\nTry using --verbose for more information.');
		throw err;
	} };
}
