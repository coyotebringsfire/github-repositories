var util 			= require('util'),
	EventEmitter 	= require('events').EventEmitter,
	request 		= require('request'),
	bunyan 			= require('bunyan'),
	fs 				= require('fs'),
	logStream 		= fs.createWriteStream( "./logs/gr" ),
	log 			= bunyan.createLogger({
						name: "github-repo",
						stream: logStream,
						level: "info",
						src: true
					});

function GithubRepo(options) {
	"use strict";
	var _this = this;
	if( options && options.url ) {
		this.url = options.url;
	} else {
		this.url = "https://api.github.com/repositories";
	}
	if( options && options.token ) {
		this.token = options.token;
	}
	if( options && options.id && options.secret ) {
		this.client_id = options.id;
		this.client_secret = options.secret;
	}
	this.repos = [];
}
util.inherits(GithubRepo, EventEmitter);

GithubRepo.prototype.get = function(url) {
	"use strict";
	var _this = this;
	var _url = url;
	log.info("getting %s", _url);
	if( _this.token ) {
		if( !_url.match(/\?/) ) {
			_url = util.format("%s?access_token=%s", _url, _this.token);
		} else {
			_url = util.format("%s&access_token=%s", _url, _this.token);
		}
	}
	if( _this.client_id && _this.client_secret ) {
		if( !_url.match(/\?/) ) {
			_url = util.format("%s?client_id=%s&client_secret=%s", _url, _this.client_id, _this.client_secret);
		} else {
			_url = util.format("%s&client_id=%s&client_secret=%s", _url, _this.client_id, _this.client_secret);
		}
	}
	log.info("updated _url %s", _url);
	request(_url, { "headers": { "User-Agent": "github:repo:scraper" } }, function onRequest(error, response, body) {
		var jsonBody;
		log.info("error %j", error);
		log.info("body %s", body);
		//log.info("response %s %j", _this.url, response);
		log.info("response headers %j", response.headers);
		log.info("response body %s", body);
		log.info("_url %s", _url);
		var rateLimitResetTime = response.headers["x-ratelimit-reset"];
		if (!_this.stopped && !error && response.statusCode == 200) {
			log.info("_url %s", _url);
			// save and parse the Next header
			// Link: <https://api.github.com/repositories?since=367>; rel="next", <https://api.github.com/repositories{?since}>; rel="first"
			log.info(response.headers);
			if( response.headers["link"] ) {
				log.info("setting _url to %s", response.headers.link.split(";")[0].match(/<(.*)>/)[1]);
				_url = response.headers.link.split(";")[0].match(/<(.*)>/)[1];
			} else {
				_this.stop();
			}
			// parse the body and emit repo events
			jsonBody = JSON.parse(body);
			for( var repo in jsonBody ) {
				_this.repos.push( jsonBody[repo] );
				_this.emit( "repo", jsonBody[repo] );
			}
			log.info("_url %s", _url);
			// get the next set of repos if there is rate-limit remaining, otherwise set a timeout for when the ratelimit will reset
			if( response.headers["x-ratelimit-remaining"] > 0 ) {
				log.info("getting %s", _url);
				_this.get(_url);				
			} else {
				log.info("waiting for rateLimit to reset %d",rateLimitResetTime - Date.now() );
				(function getURL(u) {
					var diffTime = rateLimitResetTime - Date.now();
					log.info("getting %s reset time:%d now:%d diff:%d", u, rateLimitResetTime, Date.now(), diffTime);
					setTimeout( function onTimeout() {
						log.info("onTimeout %s", u);
						_this.get(u); 
					}, diffTime);
				})(_url);
			}
		}
	});
};

GithubRepo.prototype.start = function() {
	"use strict";
	this.stopped = false;
	this.get(this.url);
};

GithubRepo.prototype.stop = function() {
	"use strict";
	this.stopped = true;
};

module.exports = GithubRepo;
