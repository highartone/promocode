console.log('Start save statistics! ', new Date());

var config = require('../config'),
    redis = require('redis').createClient(config.get('db:redis:port'),config.get('db:redis:host')),
    Shops = require('../models/shops'),
    mongo = require('../services/mongo');

var end = function(err){
    if(err){console.trace(err);}
    redis.quit();
    mongo.close();
    console.log('End save statistics! ', new Date());
};
redis.HGETALL('prommy:stat', function(err, values){
    if(err){end(err);}
    else{
        console.log(values);
        var multi = redis.multi();
        var data = Object.keys(values).map(function(id){
            var count = +values[id];
            multi.hincrby('prommy:stat',id,-count);
            return {id: id, rating: count};
        });
        Shops.updateRating(data)
            .then(function () {
                multi.exec(end);
            })
            .fail(end);
    }
});
