module.exports = function(req,res,app){
    var data = {};
    
    var term = decodeURIComponent(req.url.match(/term=([\s\S]*)/)[1]).replace(/\+/g, ' ');

    app.Categories.getAll('categoriesForPromocodes')
        .then(function (categories) {
            data.categories = categories[0].categoriesForPromocodes;

            app.Promocodes.getAllSearch(term, 15, 0)
                .then(function (promocodes) {
                    data.promocodes = promocodes;
                    data.noResult = data.promocodes.length ? false : true;
                    data.promocode = 0;

                    app.Shops.getAllSearch(term)
                        .then(function(shops){
                            data.shops = shops;
                            data.noShopsResult = shops.length ? false : true;
    
                            app.Shops.getTop()
                                .then(function (shops) {
                                    data.topShops = shops.filter(function(shop){
                                        return shop.rating ? true : false;
                                    });
    
                                    app.Banners.getAll().then(function(banners){
                                        data.banners = banners ? banners : null;
    
                                        app.just.render('index',{data: data},function(err,html){
                                            if(err){console.log(err);}
                                            else{
                                                res.setHeader('Content-Type', 'text/html');
                                                res.write(html);
                                            }
                                            res.end();
                                        });
                                    });
                                });
                        });
                });
        })
        .fail(function (err) {
            console.log('Categories.getAll fail error: '+err);
            app.mongo.close();
            res.end();
        });
};