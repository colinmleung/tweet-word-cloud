var express = require('express');
var app = express();
var events = require('events');
var credentials = require('./credentials.js');

var mongoose = require('mongoose');

var Tweet = require('./models/Tweet')(mongoose);
var HashtagCount = require('./models/HashtagCount')(mongoose, Tweet);

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
    HashtagCount.update();
    HashtagCount.getList(function(err, docs) {
		res.render('index.jade', {data: JSON.stringify(docs)});
	});
});

app.get('/:hashtag', function (req, res) {
	var hashtag = req.params.hashtag;
	res.send(200);
	//res.render('tweetfeed.jade');
});



var port = 8080;
app.listen(port);

// Child Processes

var childProcess = require('child_process'),
	addTweets,
	deleteTweets;
	
addTweets = childProcess.exec('node ./data_stream/import_data.js', function (error, stdout, stderr) {
   if (error) {
     console.log(error.stack);
     console.log('Error code: '+error.code);
     console.log('Signal received: '+error.signal);
   }
   console.log('Child Process STDOUT: '+stdout);
   console.log('Child Process STDERR: '+stderr);
 });

 addTweets.on('exit', function (code) {
   console.log('Child process exited with exit code '+code);
 });