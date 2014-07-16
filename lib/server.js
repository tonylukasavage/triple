var constants = require('./constants'),
  net = require('net');

var clients = [];
var server = net.createServer(function(c) {
  clients.push(c);

  // client disconnected
  c.on('end', function() {
    console.log('server disconnected');
    var index = clients.indexOf(c);
    if (index !== -1) {
    	clients.splice(index,1);
    }
  });

  // listen for returned data
  c.once('data', function(data) {
    server.emit('ready');
    c.on('data', function(data) {
      console.log(data.toString());
      process.stdout.write(constants.PROMPT);
    });
  });

});

// send message for eval to client(s)
server.on('message', function(message) {
	clients.forEach(function(c) {
		c.write(message);
	});
});

module.exports = server;
