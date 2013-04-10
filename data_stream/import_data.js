// Imports new Tweets in real-time using Twitter's Stream API

var io = require('socket.io'),
    express = require('express');
  
var app = express(),
    server = require('http').createServer(app),
    io = io.listen(server);
server.listen(8080);

var credentials = require('../credentials.js');

// connect to the mongodb database and set up the ORM
var mongoose = require('mongoose');
mongoose.connect(credentials.mongodb_access);
var HashtagCount = require('../models/HashtagCount.js')(mongoose);
var Tweet = require('../models/Tweet.js')(mongoose, HashtagCount);

// connect to Twitter through the twit library and set up the stream
var Twit = require('twit');
var T = new Twit(credentials.twitter_access);
var stream = T.stream('statuses/sample');

var top_hashtag_list = [];

stream.on('tweet', function (tweet) {
    if (tweet && tweet.id && tweet.entities && tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
        var hashtags = [];
        var count = tweet.entities.hashtags.length;
        for (var i = 0; i < count; i++) {
            hashtags[i] = tweet.entities.hashtags[i].text;
        }
        // emit socket.io messages if tweet contains top 100 hashtags
        emitTweet(tweet.text, hashtags);
        
        // add new tweets to the mongodb database
        Tweet.add(tweet.id, hashtags);
    }
});

// Compares tweet hashtags with top 100, and emits tweet to correct rooms
function emitTweet(text, hashtags) {
    // find hashtags in top 100
    var good_hashtags = getIntersect(hashtags, top_hashtag_list);
    
    // emit tweet in socket.io rooms with relevant hashtags
    var length = good_hashtags.length;
    for (var i = 0; i < length; i++) {
        //console.log('Socket emitting in room ' + good_hashtags[i] + ': ' + text);
        io.sockets.in(good_hashtags[i]).emit('tweet', { tweet: text });
    }
    
    function getIntersect(arr1, arr2) {
     var r = [], o = {}, l = arr2.length, i, v;
     for (i = 0; i < l; i++) {
         o[arr2[i]] = true;
     }
     l = arr1.length;
     for (i = 0; i < l; i++) {
         v = arr1[i];
         if (v in o) {
             r.push(v);
         }
     }
     return r;
    }
}

// Pushes top 100 hashtags to top_hashtag_list every 60 seconds
setInterval(function() {
    Tweet.countTags(function (err, docs) {
        HashtagCount.getList(function (err, docs) {
            var length = docs.length;
            for (var i = 0; i < length; i++) {
                top_hashtag_list[i] = docs[i].hashtag;
            }
        });
    });
}, 60000);