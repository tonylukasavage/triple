var isTi = typeof Titanium !== 'undefined';

module.exports = {
	CONNECT_MESSAGE: '[[[triple connect]]]',
	CLEAR_MESSAGE: '[[[triple clear]]]',
	EOM: '<triple eom>',
	PROMPT: '> ',
	CONTINUE_PROMPT: '... ',
	HOST: isTi && Ti.Platform.osname === 'android' ? '10.0.2.2' : 'localhost',
	PORT: 8192,
	PORT_FILE: 8193
};