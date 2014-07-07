var global = this;

var socket = Ti.Network.Socket.createTCP({
	host: 'localhost', port: 8124,
	connected: function (e) {
		//Ti.API.info('Socket opened!');
		Ti.Stream.pump(e.socket, readCallback, 1024, true);
		// Ti.Stream.write(socket, Ti.createBuffer({
		// 	value: 'GET http://blog.example.com/index.html HTTP/1.1\r\n\r\n'
		// }), writeCallback);
	},
	error: function (e) {
		Ti.API.info('Error (' + e.errorCode + '): ' + e.error);
	},
});
socket.connect();

function writeCallback(e) {
  //Ti.API.info('Successfully wrote to socket.');
}

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