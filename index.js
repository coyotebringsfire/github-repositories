var util 			= require('util'),
	EventEmitter 	= require('events').EventEmitter,
	request 		= require('request');

function GithubRepo(options) {
	"use strict";
	if( options && options.url ) {
		this.url = options.url;
	} else {
		this.url = "https://api.github.com/repositories";
	}
	util.inherits(this, EventEmitter);
}

GithubRepo.prototype.start = function() {
	"use strict";
	this.req = request(this.url, function onRequest(error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body); // Show the HTML for the Google homepage.
		}
	});
};

module.exports = GithubRepo;
