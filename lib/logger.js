var chalk = require('chalk');

exports.verbose = false;

var logMap = [
	{ name: 'error', fn: 'error', color: chalk.red.bold },
	{ name: 'warn',  fn: 'warn',  color: chalk.yellow.bold },
	{ name: 'log',   fn: 'log',   color: chalk.white },
	{ name: 'debug', fn: 'log',   color: chalk.gray },
	{ name: 'system', fn: 'log',  color: chalk.gray }
];

logMap.forEach(function(o) {
	exports[o.name] = function() {
		if (o.name === 'debug' && !exports.verbose) { return; }
		var args = Array.prototype.slice.call(arguments);
		if (args[0] && Object.prototype.toString.call(args[0]) === '[object String]') {
			if (o.name === 'system') {
				args[0] = o.color('[') + o.color(args[0]) + o.color(']');
			} else {
				args[0] = o.color(args[0]);
			}
		}
		console[o.fn].apply(console, args);
	};
});