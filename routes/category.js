module.exports = function(req,res,app,pageName,category){
    var data = {};

    if(pageName === 'promocodes'){
        app.Categories.getAll('categoriesForPromocodes')
            .then(function (categories) {
                data.categories = categories[0].categoriesForPromocodes;
                data.category = category;

                app.Promocodes.getAllCategory(category, 15, 0)
                    .then(function (promocodes) {
                        data.promocodes = promocodes;

                        app.Shops.getTop()
                            .then(function (shops) {
                                data.topShops = shops.filter(function(shop){
                                    return true ? shop.rating : false;
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
    }else if (pageName === 'shops'){
        app.Categories.getAll('categoriesForShops')
            .then(function (categories) {
                data.categories = categories[0].categoriesForShops;
                data.category = category;

                app.Shops.getAllCategory(category)
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
    }

};