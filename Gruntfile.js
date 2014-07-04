var exec = require('child_process').exec;

var BIN = './node_modules/.bin/';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 3000,
				ignoreLeaks: false,
				reporter: 'spec'
			},
			src: ['test/**/*_test.js']
		},
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		clean: {
			src: ['tmp']
		},
		istanbul: {
			src: ['test/**/*_test.js']
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Register tasks
	grunt.registerMultiTask('istanbul', 'generate test coverage report', function() {
		var done = this.async(),
			cmd = BIN + 'istanbul cover --report html ' + BIN + '_mocha -- -R min ' +
				this.filesSrc.reduce(function(p,c) { return (p || '') + ' "' + c + '" '; });

		grunt.log.debug(cmd);
		exec(cmd, function(err, stdout, stderr) {
			if (err) { grunt.fail.fatal(err); }
			if (/No coverage information was collected/.test(stderr)) {
				grunt.fail.warn('No coverage information was collected. Report not generated.');
			} else {
				grunt.log.ok('test coverage report generated to "./coverage/index.html"');
			}
			done();
		});
	});
	grunt.registerTask('coverage', ['istanbul', 'clean']);
	grunt.registerTask('test', ['mochaTest']);
	grunt.registerTask('default', ['jshint', 'mochaTest', 'clean']);

};