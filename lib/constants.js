var isTi = typeof Titanium !== 'undefined';

module.exports = {
	CONNECT_MESSAGE: '[[[triple connect]]]',
	CLEAR_MESSAGE: '[[[triple clear]]]',
	PROMPT: '> ',
	CONTINUE_PROMPT: '... ',
	HOST: isTi && Ti.App.Properties.getString('triple.host', '0.0.0.0'),
	PORT: {
		ANDROID: isTi && Ti.App.Properties.getInt('triple.port.android', 0),
		IOS: isTi && Ti.App.Properties.getInt('triple.port.ios', 0)
	}
};