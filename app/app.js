var constants = require('constants'),
	util = require('util');

var global = this;

var socket = Ti.Network.Socket.createTCP({
	host: 'localhost',
	port: 8124,
	connected: function (e) {
		Ti.Stream.pump(e.socket, readCallback, 1024, true);
		Ti.Stream.write(e.socket, Ti.createBuffer({
			value: constants.CONNECT_MESSAGE
		}), function(){});
	},
	error: function (e) {
		Ti.API.error('Error (' + e.errorCode + '): ' + e.error);
	},
});
socket.connect();

function readCallback(e) {
	if (e.bytesProcessed === -1) {
		Ti.API.error('socket error, try again [no bytes]');
	}
	try {
		if(e.buffer) {
			var received = e.buffer.toString(),
				ret = eval.call(global, received);

			Ti.Stream.write(socket, Ti.createBuffer({
				value: util.inspect(ret, { colors: true })
			}), function(){});
		} else {
			Ti.API.error('socket error, try again [no buffer]');
		}
	} catch (ex) {
		Ti.API.error(ex);
	}
}
