console.log('Start get data! ', new Date());

var config = require('../config'),
    request = require('request'),
    async = require('async'),
    Q = require('q'),
    xmlParser = require('xml2js').parseString,
    Categories = require('../models/categories'),
    Shops = require('../models/shops'),
    moment = require('moment'),
    mongo = require('../services/mongo'),
    Promocodes = require('../models/promocodes'),
    md5 = require('md5');

var options = {
    url: 'http://export.admitad.com/ru/webmaster/websites/129615/coupons/export/?website=129615&code=1be32fe186&keyword=&region=RU&only_my=on&user=iserg&format=xml&v=1',
    method: 'GET'
};

var optionsToolBar = {
    url: 'http://export.admitad.com/ru/webmaster/websites/129615/partners/export/?user=iserg&code=1be32fe186&filter=1&keyword=&region=00&action_type=&status=active&traffic_type=9&format=xml&version=2',
    method: 'GET'
};

var getToolbarData = function(){
    var deferred = Q.defer(),
        toolbarShops = {};

    request(optionsToolBar, function (err, res, body) {
        if(err) {
            console.log('getToolbarData request error: ' + err);
            deferred.reject(err);
        }else{
            xmlParser(body, function (err, content) {
                if (err) {
                    console.log('getToolbarData xmlParser error: ' + err);
                    deferred.reject(err);
                }else{
                    content.advcampaigns.advcampaign.forEach(function(item){
                        toolbarShops[item.id] = md5(item.id*Math.floor(Math.random() * 1000));
                    });
                    deferred.resolve(toolbarShops);
                }
            });
        }
    });

    return deferred.promise;
};

var getData = function(){
    console.time('parseData');

    var deferred = Q.defer(),
        promocodes = [],
        shops = [],
        categoriesForShops = [],
        categoriesForPromocodes = [],
        shopsNumber = {};
        
    request(options, function (err, res, body) {
        if(err) {
            console.log('getData request error: ' + err);
            deferred.reject(err);
        }else{
            xmlParser(body, function (err, content) {
                if (err) {
                    console.log('getData xmlParser error: ' + err);
                    deferred.reject(err);
                }else{
                    getToolbarData()
                        .then(function (hashData) {
                            // get categories for shops data
                            content.admitad_coupons.advcampaign_categories[0].category.forEach(function(item){
                                categoriesForShops.push({
                                    guid: item.$.id,
                                    id: item.$.id,
                                    name: item._.replace(/&/g, 'и')
                                });
                            });

                            // get categories for promocodes data
                            content.admitad_coupons.categories[0].category.forEach(function(item){
                                categoriesForPromocodes.push({
                                    guid: item.$.id,
                                    id: item.$.id,
                                    name: item._.replace(/&/g, 'и')
                                });
                            });

                            // get shops data
                            var i = 0;
                            content.admitad_coupons.advcampaigns[0].advcampaign.forEach(function(item){
                                shops.push({
                                    guid: item.$.id,
                                    id: item.$.id,
                                    name: item.name[0],
                                    site: item.site[0],
                                    categories: item.categories[0].category_id,
                                    logo: null,
                                    hash: hashData[item.$.id] ? hashData[item.$.id] : null
                                });
                                shopsNumber[item.$.id] = i;
                                i++;
                            });

                            // get promocodes data
                            content.admitad_coupons.coupons[0].coupon.forEach(function(item){
                                promocodes.push({
                                    guid: item.$.id,
                                    id: item.$.id,
                                    name: item.name[0],
                                    short_name: item.short_name[0],
                                    shopId: item.advcampaign_id[0],
                                    hashShop: hashData[item.advcampaign_id[0]] ? hashData[item.advcampaign_id[0]] : null,
                                    rating: item.rating[0],
                                    logo: item.logo[0],
                                    description: item.description ? item.description[0] : '',
                                    specie: item.specie_id[0] === '1' ? 'promocode' : 'action',
                                    promocode: item.promocode[0],
                                    promolink: item.promolink ? item.promolink[0] : '',
                                    gotolink: item.gotolink ? item.gotolink[0] : '',
                                    dateStart: item.date_start[0],
                                    dateEnd: moment.unix(+(new Date(item.date_end[0]).getTime())/1000).format('DD-MM-YYYY HH:mm'),
                                    dateSort: +(new Date(item.date_end[0]).getTime())/1000,
                                    exclusive: item.exclusive[0],
                                    discount: item.discount[0],
                                    categories: item.categories[0].category_id
                                });
                                if(!shops[shopsNumber[item.advcampaign_id[0]]].logo) shops[shopsNumber[item.advcampaign_id[0]]].logo = item.logo[0];
                            });

                            deferred.resolve([categoriesForShops, categoriesForPromocodes, shops, promocodes]);
                        });
                }
            });
        }
    });

    return deferred.promise;
};

getData()
    .then(function (data) {
        console.timeEnd('parseData');
        console.log('categoriesForShops number: '+data[0].length+' categoriesForPromocodes number: '+data[1].length+' shops number: '+data[2].length+' promocodes number: '+data[3].length);

        console.time('saveData');
        async.parallel([
            function(cb){
                Categories.setAll({'categoriesForShops': data[0]}, 'categoriesForShops').then(function(){cb();});
            },
            function(cb){
                Categories.setAll({'categoriesForPromocodes': data[1]}, 'categoriesForPromocodes').then(function(){cb();});
            },
            function(cb){
                Shops.setAll(data[2]).then(function(){cb();});
            },
            function(cb){
                Promocodes.setAll(data[3]).then(function(){cb();});
            }
        ], function(err) {
            if(err){
                console.log('async getData error: '+err);
            }else{
                console.timeEnd('saveData');
                console.log('Finish get data! ', new Date());
            }
            mongo.close();
        });

    })
    .fail(function (err) {
        console.log('getData fail error: '+err);
        mongo.close();
    });
