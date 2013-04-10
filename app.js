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
    setInterval(function() {
        HashtagCount.getList(function(err, docs) {
            res.render('index.jade', {data: JSON.stringify(docs)});
        });
    }, 5000);
});

app.get('/:hashtag', function (req, res) {
	var hashtag = req.params.hashtag;
	res.render('tweetfeed.jade', { data: JSON.stringify(hashtag) });
});

io.sockets.on('connection', function (socket) {
    socket.on('join tweetfeed', function (data) {
        socket.join(data.hashtag);
    });
});

// Child Processes

var forever = require('forever-monitor');

var addTweets = new (forever.Monitor)('./data_stream/import_data.js', {
  max: 3,
  silent: true,
  options: []
});

addTweets.on('exit', function () {
  console.log('import_data.js has exited after 3 restarts');
});

addTweets.start();