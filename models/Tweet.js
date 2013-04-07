module.exports = function(mongoose) {
    var TweetSchema = new mongoose.Schema({
        id: { type: Number, unique: true },
        hashtags: [String],
        createdAt: { type: Date, expires: 60*60*24, default: Date.now}
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

    return {
        add: add,
        countTags: countTags,
        Tweet: Tweet
    }
}