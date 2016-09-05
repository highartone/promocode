var cb = function(err){
    if(err){console.log(err);}
};

module.exports = function(req,res,app,id){
    res.end();
    app.redis.HINCRBY('prommy:stat', id, 1, cb);
};