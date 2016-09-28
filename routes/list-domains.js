module.exports = function(req,res,app,callback){
    var domainArr = [];

    app.Shops.getAll()
        .then(function (shops) {
            shops.forEach(function(shop){
                if(shop.hash) domainArr.push(shop.site);
            });

            if(callback){
                res.setHeader('Content-Type', 'text/javascript');
                res.write(callback+'('+JSON.stringify(domainArr)+')');
            }else{
                res.setHeader('Content-Type', 'application/json');
                res.write(JSON.stringify(domainArr));
            }

            res.end();
        })
        .fail(function (err) {
            console.log('Shops.getAll in list.js fail error: '+err);
            app.mongo.close();
            res.end();
        });
};