var mongo = require('mongodb').MongoClient,
    config = require('../config'),
    Q = require('q');

var Mongo = function () {
    this.connectionPool = [];
    this.connection = null;
    this.disconnect = false;

    this.connect();
};

Mongo.prototype.setConnection = function (connection) {
    if (this.connection) {
        this.connectionPool.push(this.connection);
        this.connection = null;
    }

    this.connection = connection;

    if (this.disconnect) {
        this.close();
    }
};

Mongo.prototype.connect = function () {
    var self = this,
        deferred = Q.defer();

    if (self.connection === null) {
        mongo.connect(
            'mongodb://' + config.get('db:mongo:host') + ':' + config.get('db:mongo:port') + '/' + config.get('db:mongo:database'),
            function (err, db) {
                if (err) {
                    console.log('MongoDB Error:', err);
                    deferred.resolve(
                        Q
                            .delay(2000)
                            .then(function () {
                                return self.connect();
                            })
                    );
                } else {
                    self.setConnection(db);
                    deferred.resolve(self.connection);
                }
            }
        );
    } else {
        deferred.resolve(self.connection);
    }

    return deferred.promise;
};
Mongo.prototype.close = function () {
    var self = this;

    self.disconnect = true;
    if (self.connection !== null) {
        self.connection.close();
    }

    for (var i = 0; i < self.connectionPool.length; ++i) {
        var pool = self.connectionPool[i];

        if (pool) {
            pool.close();
        }
    }

    self.connection = null;
};

module.exports = new Mongo();