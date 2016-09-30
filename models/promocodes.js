var Q = require('q'),
    mongo = require('../services/mongo'),
    ObjectId = require('mongodb').ObjectID.createFromHexString;

const COLLECTION_NAME = 'promocodes';

/**
 * Get all promocodes with pagination
 *
 * @param {Number} limit
 * @param {Number=0} offset
 * @returns {*|promise}
 */
exports.getAll = function (limit, offset) {
    var deferred = Q.defer();
    offset = offset || 0;

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({deleted: {$ne: true}}).sort({dateSort: 1}).skip(offset).limit(limit).toArray(function (err, data) {
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
 * Get all promocodes of a category with pagination
 *
 * @param {String} category
 * @param {Number} limit
 * @param {Number=0} offset
 * @returns {*|promise}
 */
exports.getAllCategory = function (category, limit, offset) {
    var deferred = Q.defer();
    offset = offset || 0;

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find({categories: category, deleted: {$ne: true}}).sort({dateSort: 1}).skip(offset).limit(limit).toArray(function (err, data) {
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
 * Get all promocodes of a shop with pagination
 *
 * @param {String} shop
 * @param {Number} limit
 * @param {Number=0} offset
 * @returns {*|promise}
 */
exports.getAllShop = function (shop, limit, offset) {
    var deferred = Q.defer();
    offset = offset || 0;

    var searchString = !isNaN(parseFloat(shop)) && isFinite(shop) ? {shopId: shop, deleted: {$ne: true}} : {hashShop: shop, deleted: {$ne: true}};
    
    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).find(searchString).sort({dateSort: 1}).skip(offset).limit(limit).toArray(function (err, data) {
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
 * Get all promocodes of a search string with pagination
 *
 * @param {String} term
 * @param {Number} limit
 * @param {Number=0} offset
 * @returns {*|promise}
 */
exports.getAllSearch = function (term, limit, offset) {
    var deferred = Q.defer();
    offset = offset || 0;

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME)
                .find({
                    deleted: {$ne: true},
                    $or: [
                        {name: new RegExp(term, "ig")},
                        {description: new RegExp(term, "ig")},
                        {dateEnd: new RegExp(term, "ig")},
                        {discount: new RegExp(term, "ig")}
                    ]
                })
                .sort({dateSort: 1})
                .skip(offset)
                .limit(limit)
                .toArray(function (err, data) {
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
 * Get promocode
 *
 * @param {Number} id
 * @returns {*|promise}
 */
exports.getOne = function (id) {
    var deferred = Q.defer();

    mongo.connect()
        .then(function (db) {
            db.collection(COLLECTION_NAME).findOne({id: id}, function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data);
                }
            })
        })
        .fail(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
};


/**
 * Set all promocodes
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
                    console.log('remove err in promocodes: '+err);
                    deferred.reject(err);
                } else {
                    for (var i = 0; i < data.length; ++i) {
                        var row = data[i];

                        promises.push(
                            (function (data, collection) {
                                var def = Q.defer();
                                collection.insertOne(row, function (err) {
                                    if (err) {
                                        console.log('insertOne err in promocodes: '+err);
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
            console.log('fail err in promocodes: '+err);
            deferred.reject(err);
        });

    return deferred.promise;
};