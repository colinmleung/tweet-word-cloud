module.exports = function(mongoose) {
    var TweetSchema = new mongoose.Schema({
        id: { type: Number, unique: true },
        hashtags: [String]
    });
    
    var Tweet = mongoose.model('Tweet', TweetSchema);
    
    var add = function (tweet) {
        if (tweet && tweet.id && tweet.entities && tweet.entities.hashtags && tweet.entities.hashtags.length > 0) {
            var hashtags = [];
            var count = tweet.entities.hashtags.length;
            for (var i = 0; i < count; i++) {
                hashtags[i] = tweet.entities.hashtags[i].text;
            }
            
            var tweet_doc = new Tweet({
                id: tweet.id,
                hashtags: hashtags
            });
            tweet_doc.save();
        }
    }
    
    var removeExpired = function () {
        console.log('Working');
        Tweet.find({ _id: { $lt: objectIdWithTimestamp(new Date()) } }).remove();
    }
    
    var countTags = function () {
        var o = {};
        o.map = function () {
            var count = this.hashtags.length;
            for (var i = 0; i < count; i++) {
                emit(this.hashtags[i], { count: 1 })
            }
        };
        o.reduce = function (key, values) {
            var sum = 0;
            values.forEach(function (doc) {
                sum += doc.count;
            });
            return { count: sum }
        }
        o.out = { replace: 'hashtagcounts' };
        o.verbose = true;
        o.finalize = function (key, values) {
            return new Array(key, values);
        }
        Tweet.mapReduce(o, function(err, docs){});
    }
    
    function objectIdWithTimestamp(timestamp)
    {
        // Convert string date to Date object (otherwise assume timestamp is a date)
        if (typeof(timestamp) == 'string') {
            timestamp = new Date(timestamp);
        }
        
        // Subtract a day from the datetime
        var sub_DT = Math.floor(timestamp/1000) - 86400;
        
        // Convert date object to hex seconds since Unix epoch
        var hexSeconds = sub_DT.toString(16);

        // Create an ObjectId with that hex timestamp
        var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");

        return constructedObjectId;
    }

    return {
        add: add,
        removeExpired: removeExpired,
        countTags: countTags,
        Tweet: Tweet
    }
}