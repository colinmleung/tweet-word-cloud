// Recalculate hashtag counts every 5 seconds

var credentials = require('../credentials.js');

// connect to the mongodb database and set up the Tweet ORM
var mongoose = require('mongoose');
mongoose.connect(credentials.mongodb_access);
var HashtagCount = require('../models/HashtagCount.js')(mongoose);
var Tweet = require('../models/Tweet.js')(mongoose, HashtagCount);


setInterval(function() {
    Tweet.countTags();
}, 5000);