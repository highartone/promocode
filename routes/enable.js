module.exports = function(req,res,app){

    res.writeHead(200, {
        'Set-Cookie': 'disabled=false',
        'Content-Type': 'text/html'
    });
    res.end();

};