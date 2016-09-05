var Q = require('q'),
    mongo = require('../services/mongo');

const COLLECTION_NAME = 'shops';

/**
 * Set shops data
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

            for (var i = 0; i < data.length; ++i) {
                var row = data[i];

                promises.push(
                    (function (data, collection) {
                        var def = Q.defer();
                        collection.updateOne({guid: row.guid}, {$set: row}, {upsert: true}, function (err) {
                            if (err) {
                                console.log('updateOne err in shops: '+err);
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
        })
        .fail(function (err) {
            console.log('fail err in shops: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

/**
 * Update shops rating data
 *
 * @param {Array} data
 * @returns {*|promise}
 */
exports.updateRating = function (data) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            var collection = db.collection(COLLECTION_NAME),
                promises = [];

            for (var i = 0; i < data.length; ++i) {
                var row = data[i];

                promises.push(
                    (function (data, collection) {
                        var def = Q.defer();
                        collection.updateOne({guid: row.id}, {$inc: {rating: row.rating}}, {upsert: false}, function (err) {
                            if (err) {
                                console.log('update rating error: '+err);
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
        })
        .fail(function (err) {
            console.log('fail update rating error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

/**
 * Get top shops
 *
 * @returns {*|promise}
 */
exports.getTop = function () {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({deleted: {$ne: true}})
                .sort({rating: -1})
                .limit(8)
                .toArray(function (err, data) {
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
 * Get all shops
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
 * Get all shops of a category
 *
 * @param {String} category
 * @returns {*|promise}
 */
exports.getAllCategory = function (category) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({categories: category, deleted: {$ne: true}}).toArray(function (err, data) {
                if (err) {
                    console.log('find error: '+err);
                    deferred.reject();
                } else {
                    deferred.resolve(data);
                }
            });
        })
        .fail(function (err) {
            console.log('fail error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

/**
 * Get all shops of a search 
 *
 * @param {String} term
 * @returns {*|promise}
 */
exports.getAllSearch = function (term) {
    var deferred = Q.defer();
    
    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME)
                .find({
                    deleted: {$ne: true},
                    $or: [
                        {name: new RegExp(term, "ig")},
                        {site: new RegExp(term, "ig")}
                    ]
                })
                .toArray(function (err, data) {
                    if (err) {
                        console.log('shops find error: '+err);
                        deferred.reject();
                    } else {
                        deferred.resolve(data);
                    }
                });
        })
        .fail(function (err) {
            console.log('shops find fail error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};

/**
 * Get all shops of a search
 *
 * @param {Array} links
 * @returns {*|promise}
 */
exports.getAllForBanners = function (links) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            var collection = db.collection(COLLECTION_NAME),
                promises = [];

            for (var i = 0; i < links.length; ++i) {
                var link = links[i];

                promises.push(
                    (function (data, collection) {
                        var def = Q.defer();
                        if(link){
                            collection.find({site: link}).toArray(function (err, result) {
                                if (err) {
                                    console.log('shops getAllForBanners error: '+err);
                                    def.reject(err);
                                } else {
                                    def.resolve(result);
                                }
                            });
                        }else{
                            def.resolve(null);
                        }
                        return def.promise;
                    })(link, collection)
                );
            }

            return Q.all(promises).then(function (results) {
                deferred.resolve(results);
            });
        })
        .fail(function (err) {
            console.log('shops getAllForBanners fail error: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};


