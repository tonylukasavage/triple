var _ = require('lodash'),
	acorn = require('acorn'),
	async = require('async'),
	constants = require('./constants'),
	fs = require('fs-extra'),
	logger = require('./logger'),
	path = require('path'),
	readline = require('readline'),
	request = require('request'),
	server = require('./server'),
	spinner = require('char-spinner'),
	tiappXml = require('tiapp.xml'),
	titanium = require('./titanium'),
	util = require('./util');

var DEFAULTS = {
	PROJECT: '_tmp',
	ID: 'triple.tmpapp'
};

var requireRE = /\brequire\s*\(['"](([\w\.\/-]+\/)?([\w\.\/-]*))/,
	simpleExpressionRE = /(([a-zA-Z_$](?:\w|\$)*)\.)*([a-zA-Z_$](?:\w|\$)*)\.?$/,
	tabCompletionNS = {};

module.exports = function(opts, callback) {
	var buffer = [];

	callback = arguments[arguments.length-1];
	if (!opts || _.isFunction(opts)) {
		opts = {};
	}

	if (opts.verbose) {
		titanium.verbose = true;
		logger.verbose = true;
	}

	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		completer: tabCompletion(rl)
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

		// setup titanium completion database
		function (cb) {
			titanium.sdk(function(err,sdk, version, info){
				var cacheFile = path.join(sdk.path,'triple.cache');
				if (fs.existsSync(cacheFile)) {
					return fs.readFile(cacheFile, function(err,contents){
						contents && (tabCompletionSetup(JSON.parse(contents.toString())));
						cb(err);
					});
				}
				var interval = spinner();
				fs.readFile(path.join(sdk.path,'api.jsca'), function(err,buf){
					if (err) {
						clearInterval(interval);
						logger.warn('warn: could not find api.jsca file, auto-complete disabled');
						return cb();
					}
					var tabCompletionDB = [];
					JSON.parse(buf.toString()).types.forEach(function(entry){
						tabCompletionDB.push(entry.name);
						entry.properties && entry.properties.forEach(function(prop){
							tabCompletionDB.push(entry.name+'.'+prop.name);
						});
						entry.functions && entry.functions.forEach(function(fn){
							tabCompletionDB.push(entry.name+'.'+fn.name);
						});
					});
					fs.writeFile(cacheFile, JSON.stringify(tabCompletionDB), function(err){
						clearInterval(interval);
						tabCompletionSetup(tabCompletionDB);
						cb(err);
					});
				});
			});
		},

		// create the repl project
		function(cb) {
			if (!fs.existsSync(DEFAULTS.PROJECT)) {
				logger.log('[creating app]');
				var interval = spinner();
				var createOpts = _.defaults(opts.create || {}, {
					name: DEFAULTS.PROJECT,
					id: DEFAULTS.ID,
					logLevel: 'error'
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

			// copy in all app files
			fs.readdirSync(app).forEach(function(file) {
				copy(path.join(app, file), path.join(resources, file));
			});

			// copy in shared constants file
			copy(path.join(__dirname, 'constants.js'), path.join(resources, 'constants.js'));

			// load native modules into tiapp.xml
			if(opts.module) {
				var tiapp = tiappXml.load(path.resolve(DEFAULTS.PROJECT, 'tiapp.xml'));
				opts.module.forEach(function(id) {
					logger.log('[Injecting module: %s]', id);
					tiapp.setModule(id);
				});
				tiapp.write();
			}

			cb();
		},

		// // start up repl server
		function(cb) {
			server.on('end', function(data) {
				return cb(data);
			});
			server.listen(constants.PORT, cb);
		},

		// build the repl project
		function(cb) {
			logger.log('[launching app]');
			var interval = spinner();
			var buildOpts = _.defaults(opts.build || {}, {
				projectDir: DEFAULTS.PROJECT,
				platform: 'ios',
				iosVersion: '7.1',
				noSimFocus: true,
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

			// clear spinner and prompt
			process.stdout.write('\r \r');
			rl.setPrompt(constants.PROMPT);
			rl.prompt();

			// handle each line of input
			rl.on('line', function(line) {
				var match;

				// skip empty lines
				if (!line) {
					rl.prompt();
					return;

				// handle triple commands
				} else if (match = line.match(/^\s*(\.\w*)(?:\s|$)/)) {
					var args = match.input.trim().split(/\s+/).slice(1);

					// don't put triple commands on history
					rl.history.shift();

					// execute the command
					switch(match[1].substring(1)) {
						case 'add':
							for (var i = 0; i < args.length; i++) {
								util.addToApp(args[i]);
							}
							break;
						case 'break':
							buffer = [];
							rl.setPrompt(constants.PROMPT);
							break;
						case 'clear':
							server.emit('message', constants.CLEAR_MESSAGE);
							break;
						case 'load':
							load(args, rl);
							break;
						case 'exit':
							return cb();
						case 'save':
							var file = args[0];
							if (!file) {
								logger.error('must specify path for save');
							} else {
								fs.ensureDir(path.dirname(file));
								fs.writeFileSync(file, rl.history.slice(0).reverse().join('\n'));
							}
							break;
						default:
							logger.error('invalid command "' + match[1] + '"');
							break;
					}
					rl.prompt();

				// process code
				} else {
					try {

						// handle requires
						var requireRE = /(\brequire\s*\(\s*['"])([^'"]+)(['"]\s*\))/;

						// if it contains a require(), but isn't a native require
						if ((match = line.match(requireRE)) && !_.contains(opts.module, match[2])) {
							var moduleId = match[2],
								modulePath;

							// get absolute path
							if (moduleId.indexOf('/') === 0) {
								modulePath = moduleId;
							} else {
								modulePath = path.join(process.cwd(), moduleId);
							}

							// .add it
							var addPath = modulePath + (!/\.js$/.test(modulePath) ? '.js' : '');
							util.addToApp(addPath);

							// modify the line before sending it to the app
							line = line.substring(0, match.index) + match[1] + '__modules' + modulePath +
								match[3] + line.substring(match.index + match[0].length);

						}

						// assemble code from buffer
						buffer.push(line);
						var code = buffer.join('\n');

						// validate the buffered code
						acorn.parse(code);

						// send code to server
						server.emit('message', code);

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

			// handle CTRL+C
			rl.on('SIGINT', function() {

				// If we're in a multi-line statement, break out of it
				if (buffer.length) {
					buffer = [];
					logger.log('\n(^C again to quit)');
					rl.setPrompt(constants.PROMPT);
					rl.prompt();

				// quit
				} else {
					cb();
				}
			});

			// do we have a file to load?
			if (opts.args && opts.args.length) {
				load(opts.args, rl);
			}

		}

	], callback);
};

function copy(src, dst) {
	fs.writeFileSync(dst, fs.readFileSync(src));
}

function sendLoadCommand(rl, location, content, delay) {
	try {
		acorn.parse(content);
	} catch (err) {
		logger.error('error parsing "' + location + '"');
		logger.error(err);
		return rl.prompt();
	}

	var tasks = [];
	content.split('\n').forEach(function(line){
		line = line.trim();
		if (line) {
			tasks.push(function(next){
				setTimeout(function(){
					rl.write(line + '\n');
					next();
				}, delay || 25);
			});
		}
	});
	return async.series(tasks);
}

function load(tokens, rl) {
	var location = tokens[0],
		delay = tokens[1] || 0;

	// looks like a url, fetch it
	if (/^https?:\/\//.test(location)) {
		var interval = spinner();
		return request(location, function(err,content) {
			clearInterval(interval);
			if (err) {
				logger.error('error loading "' + location + '"');
				logger.error(err);
				rl.prompt();
				return;
			}
			sendLoadCommand(rl, location, content.body, delay);
		});

	// probably a file
	} else {
		if (fs.existsSync(location)) {

			// if it's a folder, default to app.js
			if (fs.lstatSync(location).isDirectory()) {
				location = location + '/app.js';
			}
			
			return sendLoadCommand(rl, location, fs.readFileSync(location).toString(), delay);
		}
	}

	logger.error('not sure how to load "' + location + '". does it exist?');
	rl.prompt();
}

function tabCompletionSetup(tabCompletionDB) {
	if (tabCompletionDB && tabCompletionDB.length) {
		tabCompletionDB.forEach(function(name){
			var tokens = name.split('.'),
				obj = tabCompletionNS;
			for (var c=0;c<tokens.length;c++){
				var cname = tokens[c];
				var entry = obj[cname];
				if (!entry) {
					obj[cname] = entry = {};
				}
				obj = entry;
			}
		});
		tabCompletionDB = null;
		tabCompletionNS.Ti = tabCompletionNS.Titanium;
	}
}

function tabCompletion(rl) {
	return function(line) {

		var match = line.match(simpleExpressionRE);
		line = match[0];

		var tokens = line.split('.'),
			obj = tabCompletionNS,
			hits = [];

		for (var c=0;c<tokens.length;c++) {
			var token = tokens[c];
			if (token) {
				var entry = obj[token];
				if (!entry) {
					hits = Object.keys(obj).filter(function(e){
						return e.indexOf(token)===0;
					});
					obj = null;
					line = token;
					break;
				}
				obj = entry;
			}
		}

		if (obj) {
			hits = Object.keys(obj);
		}

		return [!hits.length && !line ? Object.keys(tabCompletionNS) : hits, line];
	};
}
