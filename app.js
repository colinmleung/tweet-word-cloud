var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
server.listen(8080);
    
var credentials = require('./credentials.js');

var mongoose = require('mongoose');

var HashtagCount = require('./models/HashtagCount')(mongoose);
var Tweet = require('./models/Tweet')(mongoose, HashtagCount);

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

app.get('/', function (req, res) {
    //setInterval(function() {
        HashtagCount.getList(function(err, docs) {
            res.render('index.jade', {data: JSON.stringify(docs)});
        });
    //}, 5000);
});

app.get('/:hashtag', function (req, res) {
	var hashtag = req.params.hashtag;
    res.render('tweetfeed.jade', { data: JSON.stringify(hashtag) });
});




/*****************************************/

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
        emitTweet(hashtags, tweet.text);

        // add new tweets to the mongodb database
        Tweet.add(tweet.id, hashtags);        
    }
});

function emitTweet (hashtags, text) {
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


io.sockets.on('connection', function (socket) {
  socket.on('join tweetfeed', function (data) {
    //console.log(data.hashtag);
    socket.join(data.hashtag);
  });
});

/*setInterval(function () {
    io.sockets.in('ROOM').emit('tweet', { tweet: "TWEET HERE" });
}, 5000);*/

/*****************************************/


// Child Processes

/*var forever = require('forever-monitor');

var addTweets = new (forever.Monitor)('./data_stream/import_data.js', {
  max: 3,
  silent: true,
  options: []
});

addTweets.on('exit', function () {
  console.log('import_data.js has exited after 3 restarts');
});

addTweets.start();*/

