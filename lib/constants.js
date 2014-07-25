var isTi = typeof Titanium !== 'undefined';

module.exports = {
	CONNECT_MESSAGE: '[[[triple connect]]]',
	CLEAR_MESSAGE: '[[[triple clear]]]',
	PROMPT: '> ',
	CONTINUE_PROMPT: '... ',
	HOST: isTi && Ti.App.Properties.getString('triple.host', '10.0.2.2'),
	PORT: 8192
};