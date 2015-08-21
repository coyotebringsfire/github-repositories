var util 			= require('util'),
	EventEmitter 	= require('events').EventEmitter;

function GithubRepo(options) {
	if( options && options.url ) {
		this.url = options.url;
	} else {
		this.url = "https://api.github.com/repositories";
	}
	util.inherits(this, EventEmitter);
}

GithubRepo.prototype.start = function() {
	// body...
};

module.exports = GithubRepo;