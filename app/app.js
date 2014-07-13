var constants = require('constants');

var global = this;

var socket = Ti.Network.Socket.createTCP({
	host: 'localhost', port: 8124,
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
    if (e.bytesProcessed == -1)
    {
        // Error / EOF on socket. Do any cleanup here.
        // ...
    }
    try {
        if(e.buffer) {
            var received = e.buffer.toString();
            //Ti.API.info('Received: ' + received);
            eval.call(global, received);
        } else {
            Ti.API.error('Error: read callback called with no buffer!');
        }
    } catch (ex) {
        Ti.API.error(ex);
    }
}