var should 	= require('should'),
	request = require('request'),
	nock 	= require('nock');

describe("github-repositories", function libSuite() {
	var GR 	= require('../');
	it("should return a constructor", function doIt() {
		GR.should.be.type('function');
	});
	describe("GR class", function grSuite() {
		it.skip("should make authenticated requests if an oauth token is passed in the options argument", function doit(done) {
			should.fail();
			var gr = new GR({
				token: OAUTH_TOKEN
			});
			nock(gr.url)
				.get("/repositories")
				.reply(201, '', {
					'x-ratelimit-reset': Date.now()+1000,
					'x-ratelimit-remaining': 0
				});
			gr.start();
			setTimeout(function onTimeout() {
				gr.repos.length.should.be.greaterThan(60);
				gr.stop();
				done();
			}, 1100);
		});
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
		it("should restart requests after the ratelimit has refreshed", function doIt(done) {
			this.timeout(10000);
			var gr = new GR();
			nock("https://api.github.com")
				.get("/repositories")
				.once()
				.reply(200, function(uri, requestBody) { 
					return JSON.stringify(["test", "test", "test"]);
				}, {
					'x-ratelimit-reset': Date.now()+5000,
					'x-ratelimit-remaining': 0,
					'link': "<https://api.github.com/repositories?next=100>; test" 
				});
			nock("https://api.github.com")
				.get("/repositories?next=100")
				.once()
				.reply(200, JSON.stringify(["test", "test", "test"]), { 
					'x-ratelimit-reset': Date.now()+(10*60000),
					'x-ratelimit-remaining': 0,
					'link': "<https://api.github.com/repositories?next=200>; test" 
				});
			gr.start();
			setTimeout(function onTimeout() {
				gr.repos.length.should.be.greaterThan(3);
				gr.stop();
				nock.cleanAll();
				done();
			}, 6000);
		});
		it("should pause requests until the ratelimit has refreshed", function doIt(done) {
			this.timeout(10000);
			var gr = new GR();
			nock("https://api.github.com")
				.get("/repositories")
				.once()
				.reply(200, JSON.stringify(["test", "test", "test"]), {
					'x-ratelimit-reset': Date.now()+1000,
					'x-ratelimit-remaining': 0
				});
			gr.start();
			setTimeout(function onTimeout() {
				gr.repos.length.should.equal(3);
				gr.stop();
				nock.cleanAll();
				done();
			}, 900);
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