var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var config = require('./config');

cluster.setupMaster({exec : __dirname+'/'+config.get('cluster:worker')});

for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
}

cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
    if(Object.keys(cluster.workers).length < numCPUs){
        setTimeout(function(){
            cluster.fork();
            console.log('Cluster fork!');
        },1000);
    }
});

