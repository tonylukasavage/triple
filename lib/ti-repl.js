var _ = require('lodash'),
	async = require('async'),
	exec = require('child_process').exec,
	fs = require('fs'),
	path = require('path'),
	server = require('./server'),
	spinner = require('char-spinner'),
	titanium = require('./titanium'),
	util = require('util');

var DEFAULTS = {
	PROJECT: '_tmp',
	ID: 'tirepl.tmpapp'
};

module.exports = function(opts, callback) {
	callback = arguments[arguments.length-1];
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	async.series([

		// make sure we're logged in
		function(cb) {
			titanium.loggedIn(function(err, loggedIn) {
				if (err) {
					return cb('error checking status: ' + err);
				} else if (!loggedIn) {
					return cb('You must be logged in to use ti-repl. Use `titanium login`.');
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
				//titanium.create(createOpts, cb);
			} else {
				cb();
			}
		},

		// prep app
		function(cb) {
			fs.writeFileSync(path.join(DEFAULTS.PROJECT,'Resources','app.js'),
				fs.readFileSync(path.join(__dirname,'..','app','app.js')));
			cb();
		},

		// // start up repl server
		function(cb) {
			server.listen(8124, function() { //'listening' listener
			  //console.log('server bound');
			  return cb();
			});
		},

		// // build the repl project
		function(cb) {
			console.log('- building  app...');
			var interval = spinner();
			var buildOpts = _.defaults(opts.build || {}, {
				projectDir: DEFAULTS.PROJECT,
				platform: 'ios',
				iosVersion: '7.1'
			});
			titanium.build(buildOpts, function(err, results) {
				clearInterval(interval);
				cb(err, results);
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