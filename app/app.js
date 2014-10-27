var constants = require('constants'),
	ReplClient = require('ReplClient'),
	util = require('util');

// create a new execution context with createWindow's url property
var current;

function returnReset() {
	client.write(JSON.stringify({
		data: '\u001b[36;1m[context reset]\u001b[39;22m',
		type: 'reset'
	}));
}

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
