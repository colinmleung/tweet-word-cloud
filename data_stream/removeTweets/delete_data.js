// Remove expired tweets from the mongodb database

var credentials = require('../../credentials.js');

// connect to the mongodb database and set up the Tweet ORM
var mongoose = require('mongoose');
mongoose.connect(credentials.mongodb_access);
var Tweet = require('../../models/Tweet.js')(mongoose);

// remove expired tweets
setInterval(function() {
    Tweet.removeExpired();
}, 60000);