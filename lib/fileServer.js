var net = require('net');

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