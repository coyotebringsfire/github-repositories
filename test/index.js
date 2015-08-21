var should 	= require('should');

describe("github-repositories", function libSuite() {
	var gr 	= require('../');
	it("should return a constructor", function doIt() {
		gr.should.be.type('function');
	});
});