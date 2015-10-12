var rdb = require('rethinkdb');
var dbConfig = require('../config/database');
var connection = rdb.connect(dbConfig)
.then(function (connection) {
    connection.use('trackmytruck');
    module.exports.find = function (tableName, id) {
        return rdb.table(tableName).get(id).run(connection)
        .then(function (result) {
            return result;
        });
    };

    module.exports.findAll = function (tableName) {
            return rdb.table(tableName).run(connection)
            .then(function (cursor) {
                return cursor.toArray();
            });
        };

    module.exports.findBy = function (tableName, fieldName, value) {
        return rdb.table(tableName).filter(rdb.row(fieldName).eq(value)).run(connection)
        .then(function (cursor) {
            return cursor.toArray();
        });
    };

    module.exports.findFavorite = function (truckid, userid) {
      return rdb.table('favorites').filter({
        truck_id: truckid,
        user_id: userid
        }).run(connection)
      .then(function (cursor) {
        return cursor.toArray()
      })
      ;
    };

    module.exports.favoritesIds = function (userid) {
       return rdb.table('favorites').filter({
         user_id: userid
         }).pluck('truck_id').run(connection)
       .then(function (cursor) {
         return cursor.toArray()
       })
       ; 
   } ;

    module.exports.favorites = function(userid) {

      return rdb.table('favorites')
      .eqJoin('user_id', rdb.table('users')).zip()
      .eqJoin('truck_id', rdb.table('trucks')).zip()
      .filter({
        user_id: userid,
      }).run(connection)
      .then(function (cursor) {
        return cursor.toArray();
      });
    };

    module.exports.findIndexed = function (tableName, query, index) {
        return rdb.table(tableName).getAll(query, { index: index }).run(connection)
        .then(function (cursor) {
            return cursor.toArray();
        });
    };

    module.exports.save = function (tableName, object) {
        return rdb.table(tableName).insert(object).run(connection)
        .then(function (result) {
            return result;
        });
    };

    module.exports.edit = function (tableName, id, object) {
        return rdb.table(tableName).get(id).update(object).run(connection)
        .then(function (result) {
            return result;
        });
    };

    module.exports.destroy = function (tableName, id) {
        return rdb.table(tableName).get(id).delete().run(connection)
        .then(function (result) {
            return result;
        });
    };

    module.exports.now = function () {
        return rdb.now();
    };

});