console.log('Start save statistics! ', new Date());

var config = require('../config'),
    redis = require('redis').createClient(config.get('db:redis:port'),config.get('db:redis:host')),
    Shops = require('../models/shops');

redis.HGETALL('prommy', function(err, values){
    if(err){
        console.log('redis HGETALL error: '+err);
        redis.quit();
    }else{
        var data = Object.keys(values).map(function(item){
            return {id: item, rating: parseInt(values[item])};
        });
        Shops.updateRating(data)
            .then(function () {
                redis.quit();
                console.log('Finish save statistics! ', new Date());
            });
    }
});
