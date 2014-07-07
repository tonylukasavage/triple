var net = require('net');

var clients = [];
var server = net.createServer(function(c) { //'connection' listener
  //console.log('server connected');
  clients.push(c);
  c.on('end', function() {
    console.log('server disconnected');
    var index = clients.indexOf(c);
    if (index !== -1) {
    	clients.splice(index,1);
    }
  });
  c.write('Ti.UI.createWindow({backgroundColor:"#ffa"}).open();');
  c.pipe(c);
});

server.on('message', function(message) {
	clients.forEach(function(c) {
		c.write(message);
	})
});

module.exports = server;
