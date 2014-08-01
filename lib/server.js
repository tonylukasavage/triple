var chalk = require('chalk'),
  constants = require('./constants'),
  net = require('net'),
  path = require('path'),
  util = require('./util');

var error = chalk.bold.red;
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

    // parse the initial app data response
    var appData = JSON.parse(data);

    // save the Resources directory location
    // TODO: this is very ios-specific now, will need updating
    constants.resourcesDir = appData.resourcesDir
      .replace(/%20/g, ' ')
      .replace(/^file:/, '');

    // tell the server we're ready for messages
    server.emit('ready');

    // listen for return values from app
    c.on('data', function(data) {
      var doPrompt = true,
        json = JSON.parse(data.toString());

      switch (json.type) {
        case 'error':
          console.error(json.data);
          break;
        case 'return':
          console.log(json.data);
          break;
        default:
          console.error(error('invalid message type "' + json.type + '"'));
          break;
      }

      if (doPrompt) {
        process.stdout.write(constants.PROMPT);
      }
    });
  });

});

// send message for eval to client(s)
server.on('message', function(message) {
	client.write(message);
});

module.exports = server;
