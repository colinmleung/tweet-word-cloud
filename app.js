var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);
  
server.listen(8080);
    
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
    setInterval(function() {
        HashtagCount.getList(function(err, docs) {
            res.render('index.jade', {data: JSON.stringify(docs)});
        });
    }, 5000);
});

/*app.get('/:hashtag', function (req, res) {
	var hashtag = req.params.hashtag;
	res.send(200);
	res.render('tweetfeed.jade');
});*/

/*io.sockets.on('connection', function(socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function(data) {
        console.log(data);
    });
});*/

// Child Processes

/*var childProcess = require('child_process'),
	addTweets,
	calculateHashtagCounts;
	
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
 
calculateHashtagCounts = childProcess.exec('node ./data_stream/calculate_hashtag_counts.js', function (error, stdout, stderr) {
  if (error) {
    console.log(error.stack);
    console.log('Error code: '+error.code);
    console.log('Signal received: '+error.signal);
  }
  console.log('Child Process STDOUT: '+stdout);
  console.log('Child Process STDERR: '+stderr);
});

calculateHashtagCounts.on('exit', function (code) {
  console.log('Child process exited with exit code '+code);
});*/

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

var calculateHashtagCounts = new (forever.Monitor)('./data_stream/calculate_hashtag_counts.js', {
  max: 3,
  silent: true,
  options: []
});

calculateHashtagCounts.on('exit', function () {
  console.log('calculate_hashtag_counts.js has exited after 3 restarts');
});

calculateHashtagCounts.start();