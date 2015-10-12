var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');

// View all trucks

router.get('/', function(request, response, next){
  rdb.findAll('trucks')
  .then(function (trucks){
    if(session.userID == undefined){
      response.render('trucks/index', {title: "All Trucks", allTrucks: trucks, currentUser: null, favorites: null});
    }
    rdb.find('users', session.userID)
    .then(function (user){
      rdb.favoritesIds(user.id)
      .then(function(favorites){
        favoriteIds = []
        favorites.forEach(function(favorite){
          favoriteIds.push(favorite.truck_id)
        })
      response.render('trucks/index', {title: 'All Trucks', allTrucks: trucks, currentUser: user, favorites: favoriteIds});
      })
      });
    // response.render('trucks/index', {allTrucks: trucks})
  })
})

// New Truck Form

router.get('/new', function(request, response, next) {
    response.render('trucks/new', {title: 'New Truck'});
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
      response.render('trucks/show', {title: truck.name+"'s Profile", truck: truck});
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
        session.userID = currentTruck.id;
        session.userType = 'truck';
        response.redirect('/trucks/'+currentTruck.id)
      })

    });
  });
});


module.exports = router;
