var Q = require('q'),
    mongo = require('../services/mongo'),
    ObjectId = require('mongodb').ObjectID.createFromHexString;

const COLLECTION_NAME = 'banners';

/**
 * Set banners data
 *
 * @param {Array} data
 * @returns {*|promise}
 */
exports.setAll = function (data) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            var collection = db.collection(COLLECTION_NAME),
                promises = [];

            collection.removeMany({}, function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    for (var i = 0; i < data.length; ++i) {
                        var row = data[i];

                        promises.push(
                            (function (data, collection) {
                                var def = Q.defer();
                                collection.insertOne(row, function (err) {
                                    if (err) {
                                        def.reject(err);
                                    } else {
                                        def.resolve();
                                    }
                                });
                                return def.promise;
                            })(row, collection)
                        );
                    }

                    return Q.all(promises).then(function () {
                        deferred.resolve();
                    });
                }
            });
        })
        .fail(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
};

/**
 * Get all banners
 *
 * @returns {*|promise}
 */
exports.getAll = function () {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({deleted: {$ne: true}}).toArray(function (err, data) {
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

/**
 * Removes banner by id
 *
 * @param {String} id
 * @returns {*|promise}
 */
exports.remove = function (id) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).findOneAndUpdate(
                {_id: ObjectId(id), deleted: {$ne: true}},
                {$set: {deleted: true}},
                function (err, result) {
                    if (err) {
                        console.log('remove banner err: '+err);
                        deferred.reject(err);
                    } else {
                        //console.log('remove banner result: '+result);
                        deferred.resolve();
                    }
                }
            );
        })
        .fail(function (err) {
            console.log('remove banner fail: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};



