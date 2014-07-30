var constants = require('constants'),
	ReplClient = require('ReplClient'),
	util = require('util');

// create a new execution context with createWindow's url property
var current;
function resetContext() {
	if (current) { current.close(); }
	current = Ti.UI.createWindow({ url: 'context.js' });
	current.open();
}
resetContext();

// create repl client socket
var client = new ReplClient(function(code) {
	if (code === constants.CLEAR_MESSAGE) {
		resetContext();
	} else {
		Ti.App.fireEvent('app:eval', { code: code });
	}
});

// Listen for return events
Ti.App.addEventListener('app:return', function(e) {
	client.write(JSON.stringify({
		type: 'return',
		data: util.inspect(e.value, { colors: true })
	}));
});

Ti.App.addEventListener('app:error', function(e) {
	client.write(JSON.stringify({
		type: 'error',
		source: 'eval',
		data: util.error(e.value)
	}));
});

// connect to server
client.connect();
