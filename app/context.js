var global = this;

Ti.App.addEventListener('app:eval', function(e) {
	var value = eval.call(global, e.code);
	Ti.App.fireEvent('app:return', { value: value });
});