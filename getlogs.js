var api = require('nodejitsu-api');
var fs = require('fs');
var credentials = require('./credentials.js');

var client = api.createClient(credentials.nodejitsu_access);

client.logs.byApp('realtimetagcloud.com', 1000, function (err, data) {
    var count = data.data.length;
    for (var i = 0; i < count; i++) {
        fs.appendFile("logs.txt", JSON.stringify(data.data[i].json.message) + '\n', function(err) {
            if(err) {
                console.log(err);
            }
        }); 
    }
});