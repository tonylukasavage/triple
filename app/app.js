var constants = require('constants'),
	ReplClient = require('ReplClient'),
	util = require('util');

// create a new execution context with createWindow's url property
var current;
function resetContext() {
	if (current) {
		current.removeEventListener('close', resetContext);
		Ti.App.fireEvent('app:reset');
	}
	current = Ti.UI.createWindow({
		url: 'context.js',
		exitOnClose: false
	});
	current.addEventListener('close', resetContext);
	current.open();
}
resetContext();

// create repl client socket
var client = new ReplClient(function(code) {
	if (code === constants.CLEAR_MESSAGE) {
		current.close();
	} else {
		Ti.App.fireEvent('app:eval', { code: code });
	}
});

Ti.App.addEventListener('app:return', function(e) {
	client.write(JSON.stringify({
		data: util.inspect(e.value, { colors: true }),
		type: 'return'
	}));
});

Ti.App.addEventListener('app:error', function(e) {
	var ret = {
		code: e.code,
		data: util.error(e.value),
		type: 'error'
	};
	client.write(JSON.stringify(ret));
});

// connect to server
client.connect();
