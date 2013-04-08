module.exports = function(mongoose, HashtagCount) {
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
        //o.out = { replace: 'hashtagcounts' };
        o.out = { inline: 1 }
        o.verbose = true;
        o.finalize = function (key, values) {
            return new Array(key, values);
        }
        Tweet.mapReduce(o, function(err, docs){
            /*docs.find().sort('-value.count').limit(100).exec(function(err, docs) {
                db.hashtagcounts.insert(docs);
            });*/
            
            docs.sort(compareHashtagCounts);
            docs = docs.slice(0,100);
            transform(docs);
            //var hashtag_count_model = new HashtagCount.HashtagCount();
            HashtagCount.remove();
            HashtagCount.create(docs);
            
            //saveToMongoDB(docs);
            
            function transform(array) {
                for (var i = 0; i < array.length; i++) {
                    array[i] = { hashtag: array[i].value[0], count: array[i].value[1].count };
                }
            }
            
            /*function saveToMongoDB(array) {
                array.forEach(function (item) {
                    var hashtagcount_doc = new HashtagCount.HashtagCount();
                    hashtagcount_doc.hashtag = item.value[0];
                    hashtagcount_doc.count = item.value[1].count;
                    hashtagcount_doc.save();
                });
            }*/
            
            function compareHashtagCounts(a, b) {
                return b.value[1].count - a.value[1].count;
            }
        });
    }

    return {
        add: add,
        countTags: countTags,
        Tweet: Tweet
    }
}