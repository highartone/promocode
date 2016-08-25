var Q = require('q'),
    mongo = require('../services/mongo');

/**
 * Set categories data
 *
 * @param {Array} data
 * @returns {*|promise}
 */
exports.setAll = function (data, collectionName) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            var collection = db.collection(collectionName);
            collection.removeMany({}, function (err) {
                if (err) {
                    console.log('Mongo categories error: '+err);
                    deferred.reject(err);
                } else {
                    collection.insertOne(data, function (err, result) {
                        if (err) {
                            console.log('Mongo categories insert error: '+err);
                            deferred.reject(err);
                        } else {
                            delete data['_id'];
                            //console.log('Mongo categories insert result: '+result);
                            deferred.resolve(result);
                        }
                    });
                }
            });
        })
        .fail(function (err) {
            console.log('Mongo categories connect error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

exports.getAll = function (collectionName) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(collectionName).find({}).toArray(function (err, data) {
                if (err) {
                    deferred.reject();
                } else {
                    deferred.resolve(data);
                }
            });
        })
        .fail(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
};

