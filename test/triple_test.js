var triple = require('..'),
	should = require('should');

describe('triple', function() {

	it('exists', function() {
		should.exist(triple);
		triple.should.be.a.Function;
	});

});