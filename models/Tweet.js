module.exports = function(mongoose, HashtagCount) {
    var TweetSchema = new mongoose.Schema({
        id: { type: Number, unique: true },
        hashtags: [String],
        createdAt: { type: Date, expires: 60*60, default: Date.now}
    });
    
    var Tweet = mongoose.model('Tweet', TweetSchema);
    
    var add = function (id, hashtags) {
        var tweet_doc = new Tweet({
            id: id,
            hashtags: hashtags
        });
        tweet_doc.save();
    }
    
    var countTags = function (callback) {
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
        o.out = { inline: 1 }
        o.verbose = true;
        o.finalize = function (key, values) {
            return new Array(key, values);
        }
        Tweet.mapReduce(o, function(err, docs){
            
            docs.sort(compareHashtagCounts);
            docs = docs.slice(0,50);
            transform(docs);
            
            HashtagCount.remove(function () {
                HashtagCount.create(docs, callback);
            });
            
            function transform(array) {
                for (var i = 0; i < array.length; i++) {
                    array[i] = { hashtag: array[i].value[0], count: array[i].value[1].count };
                }
            }

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