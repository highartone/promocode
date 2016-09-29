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

    var cookies = parseCookies(req);

    app.just.render('options',{data: cookies.disabled},function(err,html){
        if(err){console.log(err);}
        else{
            res.setHeader('Content-Type', 'text/html');
            res.write(html);
        }
        res.end();
    });
    
};