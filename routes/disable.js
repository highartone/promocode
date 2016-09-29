module.exports = function(req,res,app){

    res.writeHead(200, {
        'Set-Cookie': 'disabled=true',
        'Content-Type': 'text/html'
    });
    res.end();

};