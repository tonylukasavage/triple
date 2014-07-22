var isTi = typeof Titanium !== 'undefined';

module.exports = {
	CONNECT_MESSAGE: '[[[triple connect]]]',
	PROMPT: '> ',
	CONTINUE_PROMPT: '... ',
	HOST: isTi && Ti.Platform.osname === 'android' ? '10.0.2.2' : 'localhost',
	PORT: 8192
};