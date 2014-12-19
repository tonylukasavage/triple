var isTi = typeof Titanium !== 'undefined';

var exports = module.exports = {
	CONNECT_MESSAGE: '[[[triple connect]]]',
	CLEAR_MESSAGE: '[[[triple clear]]]',
	EOM: '<triple eom>',
	PROMPT: '> ',
	CONTINUE_PROMPT: '... ',
	HOST: isTi && Ti.Platform.osname === 'android' ? (Ti.Platform.model.indexOf('Genymotion') === 0 ? '192.168.56.1' : '10.0.2.2') : 'localhost',
	PORT: 8192,
	PORT_FILE: 8193
};

if (isTi) {
	exports.FILE_DIR = Ti.Platform.name === 'iPhone OS' ? Ti.Filesystem.resourcesDirectory :
		Ti.Filesystem.applicationDataDirectory;
}
