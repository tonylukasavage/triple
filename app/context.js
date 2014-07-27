var global = this;

Ti.App.addEventListener('app:eval', function(e) {
	try {
		var value = eval.call(global, e.code);
		Ti.App.fireEvent('app:return', { value: value });
	} catch (e) {
		Ti.App.fireEvent('app:error', { value: e.toString() });
	}
});