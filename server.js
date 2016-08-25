var config = require('./config');
var http = require('http');
var app = require('./app');

console.log('start server - '+app.config.get('server:host')+':'+app.config.get('server:port'));
http.createServer(function(req, res) {
    if (req.method === 'POST') {
        var form = new app.multiparty.Form();
        form.parse(req, function(err, fields, files) {
            if (err) {
                res.writeHead(400, {'content-type': 'text/plain'});
                res.end('invalid request: ' + err.message);
            }else{
                req.fields = fields;
                req.files = files;
                app.routing(req,res);
            }
        });
    }else{
        app.routing(req,res);
    }
}).listen(app.config.get('server:port'),app.config.get('server:host'));