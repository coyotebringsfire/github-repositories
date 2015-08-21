var should 	= require('should');

describe("github-repositories", function libSuite() {
	var GR 	= require('../');
	it("should return a constructor", function doIt() {
		GR.should.be.type('function');
	});
	describe("GR class", function grSuite() {
		it("should use the default github api URL", function doIt(done) {
			var gr = new GR();
			gr.url.should.equal("https://api.github.com/repositories");
			done();
		});
		it("should use the custom url passed in the options object passed as the first argument", function doIt(done) {
			should.fail();
		});
		describe("#stop", function stopMethod() {
			it("should stop requesting repositories", function doIt(done) {
				should.fail();
			});
		});
		describe("#start", function startMethod() {
			it("should start requesting repositories", function doIt(done) {
				should.fail();
			});
		});
		it("should emit a repo event for each repo returned", function doIt(done) {
			var gr = new GR();
			gr.on('repo', function(evt) {
				gr.stop();
				done();
			});
		});
	});
});