var util 			= require('util'),
	EventEmitter 	= require('events').EventEmitter,
	request 		= require('request'),
	bunyan 			= require('bunyan'),
	fs 				= require('fs');

function GithubRepo(options) {
	"use strict";
	if( options && options.url ) {
		this.url = options.url;
	} else {
		this.url = "https://api.github.com/repositories";
	}
	this.logStream = fs.createWriteStream( "./logs/gr" );
	this.log = bunyan.createLogger({
		name: "github-repo",
		stream: this.logStream,
		level: "info"
	});
	this.repos = [];
}
util.inherits(GithubRepo, EventEmitter);

GithubRepo.prototype.get = function() {
	var _this = this;
	this.log.info("getting %j", this);
	request.get(this.url, { "headers": { "User-Agent": "github:repo:scraper" } }, function onRequest(error, response, body) {
		var rateLimitResetTime = response.headers["x-ratelimit-reset"];
		_this.log.info("response headers %j", response.headers);
		_this.log.info("response body %s", body);
		if (!_this.stopped && !error && response.statusCode == 200) {
			// save and parse the Next header
			// Link: <https://api.github.com/repositories?since=367>; rel="next", <https://api.github.com/repositories{?since}>; rel="first"
			_this.url = response.headers.link.split(";")[0].match(/<(.*)>/)[1];
			// parse the body and emit repo events
			jsonBody = JSON.parse(body);
			for( var repo in jsonBody ) {
				_this.repos.push( jsonBody[repo] );
				_this.emit( "repo", jsonBody[repo] );
			}

			// get the next set of repos if there is rate-limit remaining, otherwise set a timeout for when the ratelimit will reset
			if( response.headers["x-ratelimit-remaining"] > 0 ) {
				_this.get();				
			} else {
				_this.log.info("waiting for rateLimit to reset");
				setTimeout( _this.get, rateLimitResetTime - Date.now());
			}
		}
	});
};

GithubRepo.prototype.start = function() {
	"use strict";
	this.stopped = false;
	this.get();
};

GithubRepo.prototype.stop = function() {
	"use strict";
	this.stopped = true;
};

module.exports = GithubRepo;
