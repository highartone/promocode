function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

module.exports = function(req,res,app){

    var url = false;
    try{url = app.URL.parse(req.url,true);}
    catch (e){console.log(e);}
    url = url.query.url.split('/')[2].split('.');
    url = url.length > 2 ? url[1]+'.'+url[2] : url[0]+'.'+url[1];

    var cookies = parseCookies(req);
    
    if(url && !cookies.disabled && app.domainsObj.hasOwnProperty(url.toLowerCase())){
        const TAG_FILE = __dirname + '/../tag.js';
        app.fs.readFile(TAG_FILE, function(err, data){
            if(err){
                console.log('read file err: '+err);
            }else{
                res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf8'});
                res.write(data.toString());
                res.end();
            }
        });
    }else{
        res.end();
    }

};