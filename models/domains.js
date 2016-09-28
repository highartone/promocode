var Q = require('q'),
    mongo = require('../services/mongo');

const COLLECTION_NAME = 'domains';

/**
 * Set domains data
 *
 * @param {Array} data
 * @returns {*|promise}
 */
exports.setAll = function (data) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            var collection = db.collection(COLLECTION_NAME);
            collection.removeMany({}, function (err) {
                if (err) {
                    console.log('Mongo domains error: '+err);
                    deferred.reject(err);
                } else {
                    collection.insertOne(data, function (err, result) {
                        if (err) {
                            console.log('Mongo domains insert error: '+err);
                            deferred.reject(err);
                        } else {
                            delete data['_id'];
                            deferred.resolve(result);
                        }
                    });
                }
            });
        })
        .fail(function (err) {
            console.log('Mongo domains connect error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

exports.getAll = function () {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({}).toArray(function (err, data) {
                if (err) {
                    console.log('Mongo domains getAll error: '+err);
                    deferred.reject();
                } else {
                    deferred.resolve(data);
                }
            });
        })
        .fail(function (err) {
            console.log('Mongo domains getAll fail error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

