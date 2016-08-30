module.exports = function(req,res,app,id,dir){

    const MAX_FILE_SIZE = 650000;
    const STORAGE_PATH = __dirname + '/../public/img';

    if (req.method === 'POST') {
        var banners = [],
            shopsLinks = [];

        // console.log('formData: \n');
        // console.log(req.files);
        // console.log(req.fields);

        makePath = function(ext,cb){
            var hash = app.md5((Math.random().toString() + new Date().getTime().toString() + Math.random().toString()));
            var dir = [hash.substr(0,2),hash.substr(2,2)].join('/');
            var fileName = hash.substr(8,8)+'.'+ext;
            app.fs.stat([STORAGE_PATH,'banners',dir,fileName].join('/'), function (err, stats) {
                if(err){
                    app.fs.stat([STORAGE_PATH,'banners',dir].join('/'),function(err, stats){
                        if(err){
                            app.exec('mkdir -p ' + [STORAGE_PATH,'banners',dir].join('/'),function(err){
                                cb(err,dir,fileName,hash);
                            })
                        }else{
                            console.log('dir stats'+stats);
                            cb(err,dir,fileName,hash);
                        }
                    });
                }else{
                    console.log('file stats'+stats);
                    makePath(ext,cb);
                }
            });
        };

        for(var key in req.fields){
            req.fields[key].forEach(function(item, i){
                if(!banners[i]) banners[i] = {};
                banners[i][key] = item;
                if(key == 'shop'){
                    shopsLinks.push(item);
                }
            });
        }

        app.Shops.getAllForBanners(shopsLinks).then(function(shops){
            shops.forEach(function(shop, i){
                banners[i]['shop-id'] = shop.id;
                banners[i]['shop-logo'] = shop.logo;
                banners[i]['shop-link'] = shop.site;
            });

            shopsLinks.forEach(function(item, i){
                if(i > 0 && ~shopsLinks.slice(0, i).indexOf(shopsLinks[i])){
                    var index = shopsLinks.slice(0, i).indexOf(shopsLinks[i]);
                    banners[i]['shop-id'] = banners[index]['shop-id'];
                    banners[i]['shop-logo'] = banners[index]['shop-logo'];
                    banners[i]['shop-link'] = banners[index]['shop-link'];
                }
            });

            for(var key in req.files){
                req.files[key].forEach(function(file, i, arr){
                    if(banners[i]['old-img'] !== 'new' && !file.originalFilename){
                        var ext = banners[i]['old-img'].split('.');
                        ext = ext[ext.length - 1];
                        var path = [STORAGE_PATH, banners[i]['old-img']].join('/');
                    }else{
                        var file = file;
                        var ext = file.originalFilename.split('.');
                        ext = ext[ext.length - 1];
                        var path = file.path;
                    }
                    if(file.size <= MAX_FILE_SIZE){
                        makePath(ext,function(err,dir,fileName,hash){
                            if(err){console.log('makepath err: '+err);}
                            else{
                                var pathNew = [STORAGE_PATH,'banners',dir,fileName].join('/');
                                app.fs.rename(path, pathNew, function(err){
                                    if(err){console.log('rename err: '+err);}
                                    else{
                                        banners[i]['img'] = ['banners',dir,fileName].join('/');
                                        banners[i]['guid'] = hash.substr(0,2)+hash.substr(2,2)+hash.substr(4,2)+hash.substr(6,2);
                                        if(banners[i]['old-img'] !== 'new'){
                                            app.exec('rm -r ' + [STORAGE_PATH,'banners',banners[i]['old-img'].split('/')[1]].join('/'),function(err){
                                                if(err){console.log('remove dir err: '+err);}
                                            });
                                        }
                                        delete banners[i]['old-img'];
                                        if(i == (arr.length-1)){
                                            //console.log(banners);
                                            app.Banners.setAll(banners).then(function(){
                                                res.end('complete');
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    }else{
        if(id && id !== 'undefined'){
            app.Banners.remove(id);
            if(dir !== 'undefined'){
                app.exec('rm -r ' + [STORAGE_PATH,'banners',dir].join('/'),function(err){
                    if(err){console.log('remove dir err: '+err);}
                });
            }
        }
        app.Banners.getAll().then(function(banners){
            var data= {};
            //console.log(banners);
            data.banners = banners ? banners : null;
            app.just.render('banner',{data: data},function(err,html){
                if(err){console.log(err);}
                else{
                    res.setHeader('Content-Type', 'text/html');
                    res.write(html);
                }
                res.end();
            });
        });
    }

};