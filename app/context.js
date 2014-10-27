var globalContext = this;

Ti.App.addEventListener('app:eval', function(e) {
	try {
		var value = eval.call(globalContext, e.code);
		Ti.App.fireEvent('app:return', { value: value });
	} catch (ex) {
		Ti.App.fireEvent('app:error', {
			code: e.code,
			value: ex.toString()
		});
	}
});