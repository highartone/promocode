module.exports = function(req,res,app,id){

    app.redis.HINCRBY('prommy',id,1,function(err){
        if(err){console.log(err);}
        res.end();
    });

};