module.exports = function(req,res,app){
    var data = {};

    app.Categories.getAll('categoriesForShops')
        .then(function (categories) {
            data.categories = categories[0].categoriesForShops;

            app.Shops.getAll()
                .then(function (shops) {
                    data.shops = shops;

                    app.Shops.getTop()
                        .then(function (shops) {
                            data.topShops = shops.filter(function(shop){
                                return true ? shop.rating : false;
                            });

                            app.Banners.getAll().then(function(banners){
                                data.banners = banners ? banners : null;

                                app.just.render('shops',{data: data},function(err,html){
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
};