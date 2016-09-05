module.exports = function(req,res,app,offset,category,shop,search){
    var data = {};

    if(parseInt(category)){
        app.Promocodes.getAllCategory(category, 15, parseInt(offset))
            .then(function (promocodes) {
                data.promocodes = promocodes;

                app.just.render('more',{data: data},function(err,html){
                    if(err){console.log(err);}
                    else{
                        res.setHeader('Content-Type', 'text/html');
                        res.write(html);
                    }
                    res.end();
                });
            })
            .fail(function (err) {
                console.log('more fail error: '+err);
                app.mongo.close();
                res.end();
            });
    }else if(parseInt(shop)){
        app.Promocodes.getAllShop(shop, 15, parseInt(offset))
            .then(function (promocodes) {
                data.promocodes = promocodes;

                app.just.render('more',{data: data},function(err,html){
                    if(err){console.log(err);}
                    else{
                        res.setHeader('Content-Type', 'text/html');
                        res.write(html);
                    }
                    res.end();
                });
            })
            .fail(function (err) {
                console.log('more fail error: '+err);
                app.mongo.close();
                res.end();
            });
    }else if(search !== '0'){
        app.Promocodes.getAllSearch(search.replace(/\+/g, ' '), 15, parseInt(offset))
            .then(function (promocodes) {
                data.promocodes = promocodes;

                app.just.render('more',{data: data},function(err,html){
                    if(err){console.log(err);}
                    else{
                        res.setHeader('Content-Type', 'text/html');
                        res.write(html);
                    }
                    res.end();
                });
            })
            .fail(function (err) {
                console.log('more fail error: '+err);
                app.mongo.close();
                res.end();
            });
    }else{
        app.Promocodes.getAll(15, parseInt(offset))
            .then(function (promocodes) {
                data.promocodes = promocodes;

                app.just.render('more',{data: data},function(err,html){
                    if(err){console.log(err);}
                    else{
                        res.setHeader('Content-Type', 'text/html');
                        res.write(html);
                    }
                    res.end();
                });
            })
            .fail(function (err) {
                console.log('more fail error: '+err);
                app.mongo.close();
                res.end();
            });
    }
    
};