var constants = require('./constants'),
  net = require('net');

module.exports = function(){
  var client;
  var server = net.createServer();

  server.once('connection', function(c) {

    client = c;

    // client disconnected
    c.on('end', function() {
      server.emit('end', 'client disconnected');
    });

    // listen for returned data
    c.once('data', function(data) {
      server.emit('ready');
      c.on('data', function(data) {
        server.emit('response', data);
        // console.log(data.toString());
        // process.stdout.write(constants.PROMPT);
      });
    });

  });

  // send message for eval to client(s)
  server.on('message', function(message) {
    client.write(message);
  });

  return server;
};
