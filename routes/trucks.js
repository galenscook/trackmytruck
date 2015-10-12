var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');

// View all trucks
router.get('/', function(request, response, next){
  console.log(session.userID);
  rdb.findAll('trucks')
  .then(function (trucks){
    if(session.userID === undefined){
      response.render('trucks/index', {title: "All Trucks", allTrucks: trucks, currentUser: null, favorites: null, session: session});
    }
    rdb.find('users', session.userID)
    .then(function (user){
      rdb.favoritesIds(user.id)
      .then(function(favorites){
        favoriteIds = []
        favorites.forEach(function(favorite){
          favoriteIds.push(favorite.truck_id)
        })
      response.render('trucks/index', {title: 'All Trucks', allTrucks: trucks, currentUser: user, favorites: favoriteIds, session: session});
      })
    });
  })
})

// New Truck Form
router.get('/new', function(request, response, next) {
    response.render('trucks/new', {title: 'New Truck', session: session});
});

// Show Truck Profile
router.get('/:id', function (request, response, next) {
  if(request.params.id == session.userID){
    rdb.find('trucks', request.params.id)
    .then(function (truck) {
      if(!truck) {
        var notFoundError = new Error('Truck not found');
        notFoundError.status = 404;
        return next(notFoundError);
      }
        response.render('trucks/show', {title: truck.name+"'s Profile", truck: truck, session: session});
    });
  } else {
    response.redirect('/');
  }
});

// Login Truck
router.post('/login', function (request, response, next) {
  rdb.findBy('trucks', 'yelpUrl', request.body.yelpUrl)
  .then(function (trucks) {
    truck = trucks[0];

    if(!truck) {
      response.redirect('/trucks/login');
    }
    auth.authenticate(request.body.password, truck.password)
    .then(function (authenticated) {
      if(authenticated) {
        session.userID = truck.id;
        session.userType = 'truck';
        response.redirect('/trucks/'+session.userID+'/setlocation');
      } else {
        var authenticationFailedError = new Error('Authentication failed');
        authenticationFailedError.status = 401;
        return next(authenticationFailedError);
      }
    });
  });
});

// Logout Truck
router.get('/logout', function (request, response, next){
  session.userID = null;
  session.userType = null;
  response.redirect('/');
})

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

// Set location for Truck
router.get('/:id/setlocation', function (request, response){
  if(request.params.id == session.userID){
    rdb.find('trucks', request.params.id)
    .then(function (truck) {
      if(!truck) {
        var notFoundError = new Error('Truck not found');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      response.render('trucks/setlocation', {title: truck.name+"'s Location", truck: truck, session: session});
    });
  } else {
    response.redirect('/');
  }
});

// Edit profile page
router.get('/:id/edit', function(request, response, next){
  if (request.params.id == session.userID){
    rdb.find('trucks', request.params.id)
    .then(function(truck){
      response.render('trucks/edit', {title: truck.name + "'s Profile", truck: truck, session: session})
    });
  } else {
    response.redirect('/')
  }
});

// Update profile
router.put('/:id', function(request, response){
  rdb.find('trucks', request.params.id)
  .then(function(truck){
    var updateTruck = {
      name: request.body.name || truck.name,
      description: request.body.description || truck.description,
      yelpUrl: request.body.yelpUrl || truck.yelpUrl,
      updated_at: rdb.now()
    };

    rdb.edit('trucks', truck.id, updateTruck)
    .then(function(){
      response.redirect('/trucks/' + request.params.id)
    })
  });
});

module.exports = router;

