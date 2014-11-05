var constants = require('constants'),
	ReplClient = require('ReplClient'),
	util = require('util');

var current;

// let the repl know we did a reset
function returnReset() {
	client.write('', { type: 'reset' });
}

// create a new execution context with createWindow's url property
function resetContext() {
	var hasCurrent = !!current;
	if (hasCurrent) {
		current.removeEventListener('close', resetContext);
		current.removeEventListener('open', returnReset);
		Ti.App.fireEvent('app:reset');
	}
	current = Ti.UI.createWindow({
		url: 'context.js',
		exitOnClose: false
	});
	current.addEventListener('close', resetContext);
	hasCurrent && current.addEventListener('open', returnReset);
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
	client.write(util.inspect(e.value, { colors: true }));
});

Ti.App.addEventListener('app:error', function(e) {
	client.writeError(e.value, { code: e.code });
});

// connect to server
client.connect();
