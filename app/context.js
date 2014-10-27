var globalContext = this;

function doEval(e) {
	try {
		var value = eval.call(globalContext, e.code);
		Ti.App.fireEvent('app:return', { value: value });
	} catch (ex) {
		Ti.App.fireEvent('app:error', {
			code: e.code,
			value: ex.toString()
		});
	}
}

function handleReset() {
	Ti.App.removeEventListener('app:eval', doEval);
	Ti.App.removeEventListener('app:reset', handleReset);
}

Ti.App.addEventListener('app:eval', doEval);
Ti.App.addEventListener('app:reset', handleReset);