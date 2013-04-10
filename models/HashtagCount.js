module.exports = function(mongoose) {
    var HashtagCountSchema = new mongoose.Schema({
        hashtag: String,
        count: Number
    });
    
    var HashtagCount = mongoose.model('HashtagCount', HashtagCountSchema);
    
    var getList = function (callback) {
        HashtagCount.find().exec(callback);
    };
    
    var create = function (array, callback) {
        HashtagCount.create(array, callback);
    };
    
    var remove = function (callback) {
        HashtagCount.remove({}, callback);
    };
    
    return {
        getList: getList,
        create: create,
        remove: remove,
        HashtagCount: HashtagCount
    }
}