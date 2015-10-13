var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');
var yelp = require("yelp").createClient({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET,
  ssl: true
});

// View all trucks
router.get('/', function(request, response, next){
  rdb.findAll('trucks')
  .then(function (trucks){

    if(session.userID == undefined){
      response.render('trucks/index', {title: "All Trucks", allTrucks: trucks, currentUser: null, favorites: null, session: session});
    }
    if(session.userType == 'user'){
      rdb.find('users', session.userID)
      .then(function (user){
        rdb.favoritesIds(user.id)
        .then(function(favorites){
          favoriteIds = []
          favorites.forEach(function(favorite){
            favoriteIds.push(favorite.truck_id)
          })
        // For userType 'user', render map with currentUser's favorites
        response.render('trucks/index', {title: 'All Trucks', allTrucks: trucks, currentUser: user, favorites: favoriteIds, session: session});
        })
      });
    }else{
      // For userType 'truck', render map without favorites
      response.render('trucks/index', {title: 'All Trucks', allTrucks: trucks, currentUser: null, session: session});
    }
  })
})

// New Truck Form
router.get('/new', function(request, response, next) {
    response.render('trucks/new', {title: 'New Truck', session: session});
});

// Logout Truck
router.get('/logout', function (request, response, next){
  console.log('truck logout')
  session.userID = null;
  session.userType = null;
  response.redirect('/');
})

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
  rdb.findBy('trucks', 'email', request.body.email)
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


// Creates new truck in database  **ADD IN PHOTO AND YELP AND CATEGORIES
router.post('/', function (request, response) {
  var yelpID = (request.body.yelpUrl).match(/([^\/]+)$/)[0]
  auth.hash_password(request.body.password)
  .then(function (hash) {

    var newTruck = {
      name: request.body.name,
      email: request.body.email,
      description: request.body.description,
      password: hash,
      updated_at: rdb.now()
    };

    yelp.business(yelpID, function(error, data){
      newTruck.yelpInfo = {
        url: request.body.yelpUrl,
        categories: data.categories,
        smallRating: data.rating_img_url_small,
        mediumRating: data.rating_img_url,
        largeRating: data.rating_img_url_large,
      }
      console.log(newTruck.yelpInfo.categories)
      rdb.save('trucks', newTruck)
      .then(function (result) {
        rdb.findBy('trucks', 'email', newTruck.email)
        .then(function(trucks){
          var currentTruck = trucks[0]
          session.userID = currentTruck.id;
          session.userType = 'truck';
          console.log(typeof currentTruck.yelpInfo.categories)
          response.redirect('/trucks/'+currentTruck.id)
        })
      });
    });  
  });
});

// Show truck set location page
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

// Update truck location
router.put('/:id/setlocation', function (request, response){
  if(request.params.id == session.userID){
    rdb.find('trucks', request.params.id)
    .then(function (truck) {
      if(!truck) {
        var notFoundError = new Error('Truck not found');
        notFoundError.status = 404;
        return next(notFoundError);
      } else {
        var updateTruck = {
          name: truck.name,
          description: truck.description,
          yelpUrl: truck.yelpUrl,
          updated_at: rdb.now(),
          location: request.body.location,
          closingTime: request.body.closingTime,
          promo: request.body.promo
        };

        rdb.edit('trucks', truck.id, updateTruck)
        .then(function(){
          response.send('done')
        })
      }
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

