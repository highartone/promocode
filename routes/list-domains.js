module.exports = function(req,res,app,callback){
    var domainArr = [];
    for(var i in app.domainsObj){
        domainArr.push(i);
    }
    if(callback){
        res.setHeader('Content-Type', 'text/javascript');
        res.write(callback+'('+JSON.stringify(domainArr)+')');
    }else{
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(domainArr));
    }

    res.end();
};