/*************************** Setup *********************************/

// Instantiate the application
var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
server.listen(8090);

// Import credentials for DB and Twitter
var credentials = require('./credentials.js');

// Connect to Twitter
var Twit = require('twit');
var T = new Twit(credentials.twitter_access);
var stream = T.stream('statuses/sample');

// Import models
var mongoose = require('mongoose');
var HashtagCount = require('./models/HashtagCount')(mongoose);
var Tweet = require('./models/Tweet')(mongoose, HashtagCount);

// Set application configuration details
app.configure(function () {
    app.set('view engine', 'jade');
    app.set('view options', { layout: true });
    app.set('views', __dirname + '/views');
    app.use(express.static(__dirname + '/public'));
    app.use(express.limit('1mb'));
    app.use(express.bodyParser());
    mongoose.connect(credentials.mongodb_access, function onMongooseError(err) {
        if (err) throw err;
    });
});

// Create socket.io rooms
io.sockets.on('connection', function (socket) {
  socket.on('join tweetfeed', function (data) {
    socket.join(data.hashtag);
  });
  socket.on('join hashtagcloud', function (data) {
    socket.join('hashtagcloud');
  });
});

/*************************** Pages *********************************/

// Tweetfeed Page
app.get('/:hashtag', function (req, res, next) {
	var hashtag = req.params.hashtag;
	if (top_hashtag_list.indexOf(hashtag) !== -1) {
		res.render('tweetfeed.jade', { data: JSON.stringify(hashtag) });
	} else {
		res.redirect('/');
	}
});

// Tag Cloud Page
app.get('/', function (req, res) {
    HashtagCount.getList(function(err, docs) {
        res.render('index.jade', {data: JSON.stringify(docs)});
    });
});

/********** Tweets Import and Hashtag Count Calculation ************/

var old_hashtag_list = []; // Keeps a record of the top hashtags one iteration ago
var top_hashtag_list = []; // Keeps a record of the top hashtags

stream.on('tweet', function (tweet) {
    if (tweet && tweet.id && tweet.entities && tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {

        var hashtags = [];
        var count = tweet.entities.hashtags.length;
        for (var i = 0; i < count; i++) {
            hashtags[i] = tweet.entities.hashtags[i].text;
        }
        
        // send tweetfeeds new tweet
        emitTweet(hashtags, tweet.text);

        // add tweet to DB
        Tweet.add(tweet.id, hashtags);        
    }
});

stream.on('disconnect', function (disconnectMessage) {
    console.log("TWITTER DISCONNECT MESSAGE: " + disconnectMessage);
    stream.start();
});

stream.on('warning', function (warning) {
    console.log("TWITTER WARNING:" + warning);
});

// sends tweet data to the right rooms
function emitTweet (hashtags, text) {

    var good_hashtags = getIntersect(hashtags, top_hashtag_list);

    var length = good_hashtags.length;
    for (var i = 0; i < length; i++) {
        io.sockets.in(good_hashtags[i]).emit('tweet', { tweet: text });
        io.sockets.in('hashtagcloud').emit('hashtag tweet', { hashtag: good_hashtags[i] });
    }
    
    // retrieves the intersection of two arrays
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

// updates the list of top hashtags in the DB, and assigns it to top_hashtag_list
setInterval(function() {
    Tweet.countTags(function (err, docs) {
        HashtagCount.getList(function (err, docs) {
			old_hashtag_list = top_hashtag_list.slice(0);
            var length = docs.length;
            for (var i = 0; i < length; i++) {
                top_hashtag_list[i] = docs[i].hashtag;
            }
            
            // send tag clouds updated hashtag data
            io.sockets.in('hashtagcloud').emit('update cloud', { hashtagcounts: docs });
			
			// kick people out of expired hashtag rooms
			var old_length = old_hashtag_list.length;
			for (var i = 0; i < old_length; i++) {
				if (top_hashtag_list.indexOf(old_hashtag_list[i]) === -1) {
					io.sockets.in(old_hashtag_list[i]).emit('close');
				}
			}
        });
    });
}, 60000);



