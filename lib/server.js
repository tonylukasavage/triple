var chalk = require('chalk'),
	constants = require('./constants'),
	logger = require('./logger'),
	net = require('net'),
	path = require('path'),
	util = require('./util');

var server = net.createServer(),
	client;

server.once('connection', function(c) {

	client = c;

	// client disconnected
	c.on('end', function() {
		server.emit('end', 'client disconnected');
		process.exit(1);
	});

	// listen for returned data
	c.once('data', function(data) {

		// parse the initial app data response
		var appData = JSON.parse(data);

		// save the Resources directory location
		constants.resourcesDir = appData.resourcesDir
			.replace(/%20/g, ' ')
			.replace(/^file:/, '');

		// tell the server we're ready for messages
		server.emit('ready');

		// listen for return values from app
		var didError = false,
			buffer = '';

		// handle data from the (mobile) client
		c.on('data', function(data) {
			var json;
			buffer += data.toString();

			// incomplete message, wait for more
			if (buffer.indexOf(constants.EOM) === -1) { return; }

			// get current message and put remainder in buffer
			var parts = buffer.split(constants.EOM, 2);
			data = parts[0];
			buffer = parts[1] || '';

			try {
				// parse the message as JSON
				json = JSON.parse(data);
				didError = false;
			} catch (e) {
				if (!didError) {
					didError = true;

					// let the user know the message parsing failed
					logger.error('error with return value: ' + (e.message || e.toString()));
					process.stdout.write(constants.PROMPT);
				}
				return;
			}

			// print return value or error
			switch (json.type) {
				case 'error':
					logger.error(json.data);
					break;
				case 'reset':
					clearInterval(server.resetInterval);
					logger.system('context reset');
					break;
				case 'return':
					logger.log(json.data);
					break;
				default:
					logger.error('invalid message type "' + json.type + '"');
					break;
			}
			process.stdout.write(constants.PROMPT);
		});
	});

});

// send message for eval to client(s)
server.on('message', function(message) {
	client.write(message);
});

module.exports = server;
