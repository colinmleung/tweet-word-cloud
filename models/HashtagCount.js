module.exports = function(mongoose, Tweet) {
    var HashtagCountSchema = new mongoose.Schema({
        value: [mongoose.Schema.Types.Mixed]
    });
    
    var HashtagCount = mongoose.model('HashtagCount', HashtagCountSchema);
    
    var update = function () {
        HashtagCount.remove();
        Tweet.countTags();
    }
    
    var getList = function (callback) {
        HashtagCount.find().sort('-value.count').limit(100).exec(callback);
    }
    
    return {
        update: update,
        getList: getList,
        HashtagCount: HashtagCount
    }
}