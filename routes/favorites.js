var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');



// Create new favorite
router.post('/:truckid', function (request, response) {

  console.log('IN THE POST')
  // TAKE THIS OUT ONCE CURRENTUSER IS DEFINED

  // rdb.find('users', '1878cef7-941a-4340-a160-65175f115e50')
  // .then(function(user){
  //   currentUser = user
  // });

  var newFavorite = {
    user_id: '9953d57b-b2d8-4894-b589-10b0d4571582',
    truck_id: request.params.truckid
  }

  rdb.save('favorites', newFavorite)
  .then(function(result){
    response.redirect('/trucks')
  });

});



// Unfavorite
router.delete('/:truckid', function (request, response) {

  // TAKE THIS OUT ONCE CURRENTUSER IS DEFINED

  // rdb.find('users', '1878cef7-941a-4340-a160-65175f115e50')
  // .then(function(user){
  //   currentUser = user
  // });
  console.log("IN THE DELETE")
  rdb.findFavorite(request.params.truckid, '9953d57b-b2d8-4894-b589-10b0d4571582')
  .then(function(results){
    currentFavorite = results[0]
    console.log(currentFavorite)
    rdb.destroy('favorites', currentFavorite.id)
    .then(function(result){
      response.redirect('/trucks');
      
    })
  });


});


module.exports = router;