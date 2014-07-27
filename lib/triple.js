var _ = require('lodash'),
	acorn = require('acorn'),
	async = require('async'),
	chalk = require('chalk'),
	constants = require('./constants'),
	fs = require('fs-extra'),
	ip = require('ip'),
	path = require('path'),
	readline = require('readline'),
	server = {
		android: new require('./server')(),
		ios: new require('./server')()
	},
	spinner = require('char-spinner'),
	testtcp = require('test-tcp'),
	titanium = require('./titanium'),
	tiappxml = require('tiapp.xml');

var DEFAULTS = {
	PROJECT: '_tmp',
	ID: 'triple.tmpapp',
	PORT: {
		ANDROID: 0,
		IOS: 0
	}
};

module.exports = function(opts, callback) {
	var buffer = [];

	callback = arguments[arguments.length-1];
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	if (opts.verbose) {
		titanium.verbose = true;
	}

	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

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
				console.log('[creating app]');
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
			var resources = path.join(DEFAULTS.PROJECT, 'Resources'),
				app = path.join(__dirname, '..', 'app');

			fs.readdirSync(app).forEach(function(file) {
				copy(path.join(app, file), path.join(resources, file));
			});
			copy(path.join(__dirname, 'constants.js'), path.join(resources, 'constants.js'));

			cb();
		},

		// host ip address and port injection to tiapp.xml
		function(cb) {
			var xmlfile = path.join(DEFAULTS.PROJECT, 'tiapp.xml'),
				tiapp = tiappxml.load(xmlfile);

			testtcp.empty_ports(2, function(err, ports){
				if (err) {
					cb(err);
				}

				_.each(ports, function(port, index){
					switch (index) {
						case 0:
							DEFAULTS.PORT.ANDROID = port;
							tiapp.setProperty('triple.port.android', port, 'int');
							break;
						case 1:
							DEFAULTS.PORT.IOS = port;
							tiapp.setProperty('triple.port.ios', port, 'int');
							break;
					}
				});

				tiapp.setProperty('triple.host', ip.address(), 'string');
				tiapp.write();

				cb();
			});
		},

		// start up android repl server
		function(cb) {
			if (opts.android) {
				console.log('[launching android repl server]');
				server.android.on('end', function(data) {
					console.error(chalk.bold.red('error: ' + data));
					process.exit(1);
				});
				server.android.listen(DEFAULTS.PORT.ANDROID, cb);
			} else {
				cb();
			}
		},

		// build the Android repl project
		function(cb) {
			if (opts.android) {
				console.log('[launching android app]');
				var interval = spinner();
				var buildOpts = _.defaults(opts.build || {}, {
					projectDir: DEFAULTS.PROJECT,
					platform: 'android',
					deviceId: opts.android,
					server: server.android
				});

				titanium.build(buildOpts);
				server.android.on('ready', function() {
					clearInterval(interval);
					cb();
				});
			} else {
				cb();
			}
		},

		// start up ios repl server
		function(cb) {
			if (opts.ios) {
				console.log('[launching ios repl server]');
				server.ios.on('end', function(data) {
					console.error(chalk.bold.red('error: ' + data));
					process.exit(1);
				});
				server.ios.listen(DEFAULTS.PORT.IOS, cb);
			} else {
				cb();
			}
		},

		// build the iOS repl project
		function(cb) {
			if (opts.ios) {
				console.log('[launching ios app]');
				var interval = spinner();
				var buildOpts = _.defaults(opts.build || {}, {
					projectDir: DEFAULTS.PROJECT,
					platform: 'ios',
					iosVersion: '7.1',
					deviceId: opts.ios,
					server: server.ios
				});

				titanium.build(buildOpts);
				server.ios.on('ready', function() {
					clearInterval(interval);
					cb();
				});
			} else {
				cb();
			}
		},

		// prompt
		function(cb) {
			if (!opts.android &&
				!opts.ios) {
				cb();
			}

			// clear spinner and prompt
			process.stdout.write('\r \r');
			rl.setPrompt(constants.PROMPT);
			rl.prompt();

			rl.on('line', function(line) {
				var match;

				// skip empty lines
				if (!line) {
					rl.prompt();
					return;

				// handle triple commands
				} else if (match = line.match(/^\s*(\.\w*)(?:\s|$)/)) {
					var args = match.input.trim().split(/\s+/).slice(1);
					rl.history.shift();
					switch(match[1].substring(1)) {
						case 'break':
							buffer = [];
							rl.setPrompt(constants.PROMPT);
							break;
						case 'clear':
							opts.android && server.android.emit('message', constants.CLEAR_MESSAGE);
							opts.ios && server.ios.emit('message', constants.CLEAR_MESSAGE);
							break;
						case 'exit':
							return cb();
							break;
						case 'save':
							var file = args[0];
							if (!file) {
								console.error(chalk.bold.red('must specify path for save'));
							} else {
								fs.ensureDir(path.dirname(file));
								fs.writeFileSync(file, rl.history.slice(0).reverse().join('\n'));
							}
							break;
						default:
							console.error(chalk.bold.red('invalid command "' + match[1] + '"'));
							break;
					}
					rl.prompt();

				// process code
				} else {
					try {

						// assemble code from buffer
						buffer.push(line);
						var code = buffer.join('\n');

						// validate the buffered code
						acorn.parse(code);

						// send code to server
						opts.android && server.android.emit('message', code);
						opts.ios && server.ios.emit('message', code);

						// reset buffer and prompt
						buffer = [];
						rl.setPrompt(constants.PROMPT);
					} catch (e) {

						// prompt for multi-line statement
						rl.setPrompt(constants.CONTINUE_PROMPT);
						rl.prompt();
					}
				}

			});
			rl.on('SIGINT', function() {
				if (buffer.length) {
					buffer = [];
					console.log('\n(^C again to quit)');
					rl.setPrompt(constants.PROMPT);
					rl.prompt();
				} else {
					cb();
				}
			});
		}

	], callback);
};

function copy(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}
