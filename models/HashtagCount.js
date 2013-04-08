module.exports = function(mongoose, Tweet) {
    var HashtagCountSchema = new mongoose.Schema({
        hashtag: String,
        count: Number
        //value: [mongoose.Schema.Types.Mixed]
    });
    
    var HashtagCount = mongoose.model('HashtagCount', HashtagCountSchema);
    
    var getList = function (callback) {
        HashtagCount.find().sort('-value.count').limit(100).exec(callback);
    };
    
    var create = function (array) {
        HashtagCount.create(array, function (err) {
        });
    };
    
    var remove = function () {
        HashtagCount.remove({}, function () {});
    };
    
    return {
        getList: getList,
        create: create,
        remove: remove,
        HashtagCount: HashtagCount
    }
}