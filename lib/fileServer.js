var constants = require('./constants'),
	logger = require('./logger'),
	net = require('net'),
	path = require('path'),
	util = require('./util');

var server = net.createServer(),
	client;

server.once('connection', function(c) {
	client = c;
});

// send file to client(s)
server.on('file', function(data) {
	client.write(data);
});

module.exports = server;