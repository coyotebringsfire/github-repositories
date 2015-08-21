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
			var gr = new GR({
				url: "TESTURL"
			});
			gr.url.should.equal("TESTURL");
			done();
		});
		describe("#stop", function stopMethod() {
			it("should stop requesting repositories", function doIt(done) {
				var gr = new GR();
				gr.start();
				setTimeout( function onTimeout() {
					var numRepos = gr.repos.length;
					gr.stop();
					gr.stopped.should.be.ok;
					numRepos.should.equal( gr.repos.length);
					done();
				}, 500);
			});
			it("should set stopped variable to true even if the scraper never started", function doIt(done) {
				var gr = new GR();
				gr.stop();
				gr.stopped.should.be.ok;
				done();
			});
		});
		describe("#start", function startMethod() {
			it("should start requesting repositories", function doIt(done) {
				var gr = new GR();
				gr.start();
				gr.on('repo', function onRepo(evt) {
					gr.repos.length.should.be.greaterThan(0);
					if( !gr.stopped ) {
						gr.stop();
						done();
					}
				});
			});
			it("should set stopped variable to false", function doIt(done) {
				var gr = new GR();
				gr.start();
				gr.stopped.should.not.be.ok;
				gr.stop();
				done();
			});
		});
	});
});