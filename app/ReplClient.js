var constants = require('constants');

function ReplClient(handler) {
	var self = this;

	// create Titanium socket for client
	self.socket = Ti.Network.Socket.createTCP({
		host: constants.HOST,
		port: constants.PORT,

		// handle socket errors
		error: function(err) {

			// print error back to console
			self.write(error('socket error: ' + err.toString()));

			// close connection if still open
			if (self.state === Ti.Network.Socket.CONNECTED) {
				self.close();
			}
		},

		// handle initial connection
		connected: function() {

			// pump all readable data from socket
			Ti.Stream.pump(self.socket, function(e) {
				if (e.bytesProcessed === -1 || !e.buffer) {
					self.write(error('socket error: empty buffer, try again'));
				} else {
					handler.call(self, e.buffer.toString());
				}
			}, 1024, true);

			// tell server we're ready
			self.write(constants.CONNECT_MESSAGE);
		}
	});
}

ReplClient.prototype.write = function write(data) {
	Ti.Stream.write(this.socket, Ti.createBuffer({ value: data }), function(){});
};

ReplClient.prototype.connect = function connect() {
	this.socket.connect();
}

function error(s) {
	return '\x1B[31merror: ' + s + '\x1B[39m';
}

module.exports = ReplClient;

