var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');



// Create new favorite
router.post('/:truckid', function (request, response) {


  // TAKE THIS OUT ONCE CURRENTUSER IS DEFINED

  rdb.find('users', '1878cef7-941a-4340-a160-65175f115e50')
  .then(function(user){
    currentUser = user
  });

  var newFavorite = {
    user_id: currentUser.id,
    truck_id: request.params.truckid
  }

  rdb.save('favorites', newFavorite)
  .then(function(result){
    response.redirect('/trucks')
  });

});



// Unfavorite
router.delete('/favorites/:truckid', function (request, response) {

  // TAKE THIS OUT ONCE CURRENTUSER IS DEFINED

  rdb.find('users', '1878cef7-941a-4340-a160-65175f115e50')
  .then(function(user){
    currentUser = user
  });

  rdb.findFavorite(request.params.truckid, currentUser.id)
  .then(function(results){
    currentFavorite = results[0]
    rdb.destroy('favorites', currentFavorite.id)
  });

  response.redirect('/trucks');

});


module.exports = router;