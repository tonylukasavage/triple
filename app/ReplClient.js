var constants = require('constants'),
	util = require('util');

function ReplClient(handler) {
	var self = this;

	// create Titanium socket for client
	self.socket = Ti.Network.Socket.createTCP({
		host: constants.HOST,
		port: Ti.Platform.osname === 'android' ? constants.PORT.ANDROID : constants.PORT.IOS,

		// handle socket errors
		error: function(err) {

			// print error back to console
			self.write(util.error('socket error: ' + err.toString()));

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
					self.write(util.error('socket error: empty buffer, try again'));
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

module.exports = ReplClient;

