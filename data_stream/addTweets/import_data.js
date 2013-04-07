// Imports new Tweets in real-time using Twitter's Stream API

var credentials = require('../../credentials.js');

// connect to the mongodb database and set up the Tweet ORM
var mongoose = require('mongoose');
mongoose.connect(credentials.mongodb_access);
mongoose.set('debug', true);
var Tweet = require('../../models/Tweet.js')(mongoose);

// connect to Twitter through the twit library and set up the stream
var Twit = require('twit');
var T = new Twit(credentials.twitter_access);

var stream = T.stream('statuses/sample');

// add new tweets to the mongodb database
var limit = 50;
stream.on('tweet', function (tweet) {
  if (limit > 0) {
    Tweet.add(tweet);
    limit--;
    console.log(limit);
  }
});