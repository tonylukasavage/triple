var _ = require('lodash'),
	async = require('async'),
	constants = require('./constants'),
	exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path'),
	server = require('./server'),
	spinner = require('char-spinner'),
	titanium = require('./titanium'),
	util = require('util');

var DEFAULTS = {
	PROJECT: '_tmp',
	ID: 'triple.tmpapp'
};

module.exports = function(opts, callback) {
	callback = arguments[arguments.length-1];
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	if (opts.verbose) {
		titanium.verbose = true;
	}

	async.series([

		// make sure we're logged in
		function(cb) {
			titanium.loggedIn(function(err, loggedIn) {
				if (err) {
					return cb('error checking status: ' + err);
				} else if (!loggedIn) {
					return cb('You must be logged in to use triple. Use `titanium login`.');
				}
				return cb();
			});
		},

		// create the repl project
		function(cb) {
			if (!fs.existsSync(DEFAULTS.PROJECT)) {
				console.log('- creating app...');
				var interval = spinner();
				var createOpts = _.defaults(opts.create || {}, {
					name: DEFAULTS.PROJECT,
					id: DEFAULTS.ID
				});
				titanium.create(createOpts, function(err, results) {
					clearInterval(interval);
					cb(err, results);
				});
			} else {
				cb();
			}
		},

		// prep app
		function(cb) {
			var resources = path.join(DEFAULTS.PROJECT, 'Resources');

			copy(path.join(__dirname, '..', 'app', 'app.js'), path.join(resources, 'app.js'));
			copy(path.join(__dirname, 'constants.js'), path.join(resources, 'constants.js'));

			cb();
		},

		// // start up repl server
		function(cb) {
			server.listen(8124, cb);
		},

		// build the repl project
		function(cb) {
			console.log('- launching app...');
			var interval = spinner();
			var buildOpts = _.defaults(opts.build || {}, {
				projectDir: DEFAULTS.PROJECT,
				platform: 'ios',
				iosVersion: '7.1',
				server: server
			});
			titanium.build(buildOpts);
			server.on('ready', function() {
				clearInterval(interval);
				cb();
			});
		},

		// prompt
		function(cb) {
			process.stdout.write('> ');

			process.stdin.setEncoding('utf8');
			process.stdin.on('readable', function() {
			  var chunk = process.stdin.read();
			  if (chunk !== null) {
			  	server.emit('message', chunk);
			    //process.stdout.write('data: ' + chunk);
			    process.stdout.write('> ');
			  }
			});

			process.stdin.on('end', function() {
			  process.stdout.write('end');
			  cb();
			});
		}

	], callback);
};

function copy(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}