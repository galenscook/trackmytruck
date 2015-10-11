var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');


// View all trucks

router.get('/', function(request, response, next){
  rdb.findAll('trucks')
  .then(function (trucks){
    rdb.find('users', '9953d57b-b2d8-4894-b589-10b0d4571582')
    .then(function (user){
      currentUser = user
      rdb.favoritesIds(currentUser.id)
      .then(function(favorites){
        favoriteIds = []
        favorites.forEach(function(favorite){
          favoriteIds.push(favorite.truck_id)
        })
      response.render('trucks/index', {allTrucks: trucks, currentUser: currentUser, favorites: favoriteIds});
      })
      });
    // response.render('trucks/index', {allTrucks: trucks})
  })
})

// New Truck Form

router.get('/new', function(request, response, next) {
    response.render('trucks/new');
});


// Show Truck Profile

router.get('/:id', function (request, response, next) {
  rdb.find('trucks', request.params.id)
  .then(function (truck) {
    if(!truck) {
      var notFoundError = new Error('Truck not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    // rdb.find('users', '1878cef7-941a-4340-a160-65175f115e50')
    // .then(function (user){
    //   currentUser = user
    //   });
      response.render('trucks/show', {truck: truck});
    });
  });


// Creates new truck in database  **ADD IN PHOTO AND YELP AND CATEGORIES
router.post('/', function (request, response) {
  auth.hash_password(request.body.password)
  .then(function (hash) {
    var newTruck = {
      name: request.body.name,
      description: request.body.description,
      yelpUrl: request.body.yelpUrl,
      password: hash,
      updated_at: rdb.now()
    };

    rdb.save('trucks', newTruck)
    .then(function (result) {
      rdb.findBy('trucks', 'yelpUrl', newTruck.yelpUrl)
      .then(function(trucks){
        var currentTruck = trucks[0]
        response.redirect('/trucks/'+trucks[0].id)
      })

    });
  });
});


module.exports = router;