var constants = require('constants'),
	util = require('util');

var RDIR = Ti.Platform.name === 'iPhone OS' ? Ti.Filesystem.resourcesDirectory :
	Ti.Filesystem.applicationDataDirectory;

function ReplClient(handler) {
	var self = this;

	// create Titanium socket for client messages
	self.socket = Ti.Network.Socket.createTCP({
		host: constants.HOST,
		port: constants.PORT,

		// handle socket errors
		error: function(err) {

			// print error back to console
			self.writeError('socket error: ' + err.toString());

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
					self.writeError('message socket error: empty buffer, try again');
				} else {
					handler.call(self, e.buffer.toString());
				}
			}, 1024, true);

			// tell server we're ready by sending back the resources directory
			self.write(JSON.stringify({ resourcesDir: RDIR }), { raw: true });
		}
	});

	// create Titanium socket for client files
	self.fileSocket = Ti.Network.Socket.createTCP({
		host: constants.HOST,
		port: constants.PORT_FILE,

		// handle socket errors
		error: function(err) {

			// print error back to console
			self.writeError('file socket error: ' + err.toString());

			// close connection if still open
			if (self.state === Ti.Network.Socket.CONNECTED) {
				self.close();
			}
		},

		// handle initial connection
		connected: function() {

			// pump all readable data from socket
			var buffer = Ti.createBuffer({ length: 0 }),
				size = 0;
			Ti.Stream.pump(self.fileSocket, function(e) {
				if (!e.buffer) {
					self.writeError('socket error: empty buffer, try again');
				} else {

					// get the size of the whole file transfer
					if (size === 0) {
						size = Ti.Codec.decodeNumber({
							source: e.buffer,
							position: 0,
							type: Ti.Codec.TYPE_INT,
							byteOrder: Ti.Codec.LITTLE_ENDIAN
						});
					}

					// add this data to the buffer
					buffer.append(e.buffer);

					// we've got all the bytes, let's process the file
					if (size === e.totalBytesProcessed) {

						// parse the buffer
						var filepathLen = Ti.Codec.decodeNumber({
							source: buffer,
							position: 4,
							type: Ti.Codec.TYPE_INT,
							byteOrder: Ti.Codec.LITTLE_ENDIAN
						});
						var filepath = Ti.Codec.decodeString({
							source: buffer,
							position: 4 + 4,
							length: filepathLen
						});
						var fileLen = Ti.Codec.decodeNumber({
							source: buffer,
							position: 4 + 4 + filepathLen,
							type: Ti.Codec.TYPE_INT,
							byteOrder: Ti.Codec.LITTLE_ENDIAN
						});
						var fileContent = Ti.createBuffer({
							length: fileLen
						});
						fileContent.copy(buffer, 0, 4 + 4 + filepathLen + 4, fileLen);

						// write the file
						var file = Ti.Filesystem.getFile(filepath);
						file.write(fileContent.toBlob());

						// clear the buffer
						buffer.clear();
						buffer = Ti.createBuffer({ length: 0 });
						size = 0;

						// if js/json, save it to the __modules folder
						// if (relPath) {
						// 	var modFile = Ti.Filesystem.getFile(RDIR, relPath),
						// 		modDir = Ti.Filesystem.getFile(RDIR, ); // LKHDLKSJLKDJSLDJLSDJ
						// 	modFile.write(e.buffer.toBlob());
						// }
					}
				}
			}, 1024, true);
		}
	});
}

ReplClient.prototype.write = function write(data, opts) {
	opts = opts || {};
	if (!opts.raw) {
		data = JSON.stringify({
			data: data,
			type: opts.type || 'return'
		}) + constants.EOM;
	}
	Ti.Stream.write(this.socket, Ti.createBuffer({ value: data }), function(){});
};

ReplClient.prototype.writeError = function writeError(data, opts) {
	opts = opts || {};
	opts.type = 'error';
	this.write(data, opts);
};

ReplClient.prototype.connect = function connect() {
	this.socket.connect();
	this.fileSocket.connect();
}

ReplClient.prototype.close = function() {
	this.socket.close();
	this.fileSocket.close();
};

module.exports = ReplClient;

