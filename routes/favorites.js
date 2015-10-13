var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session')

// Create new favorite
router.post('/:truckid', function (request, response) {

  console.log('IN THE POST')
  var newFavorite = {
    user_id: session.userID,
    truck_id: request.params.truckid
  }
  rdb.find('trucks', newFavorite.truck_id)
  .then(function(truck){
    rdb.findFavorite(newFavorite.truck_id, newFavorite.user_id)
    .then(function(result){
      if(result.length === 0){
        rdb.save('favorites', newFavorite)
        .then(function(result){
          response.render('partials/removeFavorite', {layout: false, truck: truck});
        });
      }
    });
  });
});

// Unfavorite
router.delete('/:truckid', function (request, response) {
  rdb.find('trucks', request.params.truckid)
  .then(function(truck){
    rdb.findFavorite(request.params.truckid, session.userID)
    .then(function(results){
      currentFavorite = results[0]
      rdb.destroy('favorites', currentFavorite.id)
      .then(function(result){
        response.render('partials/addFavorite', {layout: false, truck: truck});
      });
    });
  });
});


module.exports = router;
