var constants = require('constants'),
	ReplClient = require('ReplClient'),
	util = require('util');

// establish context for eval
var global = this;

// create repl client socket
var client = new ReplClient(function(code) {
	if (code === constants.CLEAR_MESSAGE) {
		this.write(util.error('error: .clear is not yet implemented'));
	} else {
		try {
			var ret = eval.call(global, code);
			this.write(util.inspect(ret, { colors: true }));
		} catch (e) {
			this.write(util.error(e));
		}
	}
});

// connect to server
client.connect();
