module.exports = function(req,res,app,callback){
    var hashArr = [];
    
    app.Shops.getAll()
        .then(function (shops) {
            shops.forEach(function(shop){
                if(shop.hash) hashArr.push(shop.hash);
            });

            if(callback){
                res.setHeader('Content-Type', 'text/javascript');
                res.write(callback+'('+JSON.stringify(hashArr)+')');
            }else{
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(hashArr));
            }

            res.end();
        })
        .fail(function (err) {
            console.log('Shops.getAll in list.js fail error: '+err);
            app.mongo.close();
            res.end();
        });
};