var size = 20;
var padding = 1;
var xNum = Math.ceil(Ti.Platform.displayCaps.platformWidth / (padding * 2 + size));
var yNum = Math.ceil(Ti.Platform.displayCaps.platformHeight / (padding * 2 + size));

var win = Ti.UI.createWindow({
	backgroundColor: '#fff'
});
win.open();

for (var x = 0; x < xNum; x++) {
	for (var y = 0; y < yNum; y++) {
		var base = Math.floor(255 * ((x+y)/(xNum+yNum))).toString(16).replace(/^([\da-f])$/, '0$1');
		var color = '#ff'+ base + base;
		var cell = Ti.UI.createView({
			backgroundColor: color,
			height: size,
			width: size,
			top: y * (size + (padding * 2)) + (padding * 2),
			left: x * (size + (padding * 2)) + (padding * 2)
		});
		delayAdd(cell, (x + y) * 50);
	}
}

function delayAdd(view, delay) {
	setTimeout(function() {
		win.add(view);
	}, delay);
}