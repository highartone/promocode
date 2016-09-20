module.exports = function(req,res,app){
    
    app.just.render('disabled',{},function(err,html){
        if(err){console.log(err);}
        else{
            res.setHeader('Content-Type', 'text/html');
            res.write(html);
        }
        res.end();
    });
};