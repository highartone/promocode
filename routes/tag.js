module.exports = function(req,res,app){

    function parseCookies (request) {
        var list = {},
            rc = request.headers.cookie;

        rc && rc.split(';').forEach(function( cookie ) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        return list;
    }

    var cookies = parseCookies(req);
    
    if(cookies.disabled){
        res.end();
    }else{
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
    }

};