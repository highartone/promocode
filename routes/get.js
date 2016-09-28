module.exports = function(req,res,app,hash,callback){
    var data = {text: '', url: '', img: '', all: 0};

    app.Promocodes.getAllShop(hash, 1000, 0)
        .then(function (promocodes) {
            if(promocodes.length){
                data.text = promocodes[0].name;
                data.url = 'http://prommy.ru/promocode='+promocodes[0].id;
                data.img = promocodes[0].logo;
                data.all = promocodes.length;
                data.gotoUrl = promocodes[0].gotolink;
            }

            if(callback){
                res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf8'});
                res.write(callback+'('+JSON.stringify(data)+')');
            }else{
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
                res.write(JSON.stringify(data));
            }

            res.end();
        })
        .fail(function (err) {
            console.log('Promocodes.getAllShop in get.js fail error: '+err);
            app.mongo.close();
            res.end();
        });
};