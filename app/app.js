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
		try {
			Ti.App.fireEvent('app:eval', { code: code });
		} catch (e) {
			this.write(util.error(e));
		}
	}
});

// Listen for return events
Ti.App.addEventListener('app:return', function(e) {
	client.write(util.inspect(e.value, { colors: true }));
});

// connect to server
client.connect();
