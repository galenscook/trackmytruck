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
          var allDistances = sortDistances(user, trucks);
          sortTrucks(allDistances, user, favorites, session, response);
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
  rdb.find('trucks', request.params.id)
  .then(function (truck) {
    rdb.findBy('favorites', 'truck_id', truck.id)
    .then(function(favorites){
      if(!truck) {
        var notFoundError = new Error('Truck not found');
        notFoundError.status = 404;
        return next(notFoundError);
      }

      response.render('trucks/show', {title: truck.name+"'s Profile", truck: truck, session: session, fav_num: favorites.length});
    })
  });
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
      location: null,
      updated_at: rdb.now()
    };

    yelp.business(yelpID, function(error, data){
      newTruck.yelpInfo = {
        url: request.body.yelpUrl,
        categories: data.categories,
        review_count: data.review_count,
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
          response.redirect('/trucks/'+currentTruck.id+'/setlocation')
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
          updated_at: rdb.now(),
          location: request.body.location,
          closingTime: request.body.closingTime,
          promo: request.body.promo
        };

        rdb.edit('trucks', truck.id, updateTruck)
        .then(function(){
          response.redirect('/sendmsg?_method=POST')
        })
      }
    });
  } else {
    response.redirect('/');
  }
});

// Edit profile page
router.get('/:id/edit', function(request, response, next){
  if (request.params.id === session.userID){
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
    var yelpID = (truck.yelpInfo.url).match(/([^\/]+)$/)[0]
    var updateTruck = {
      name: request.body.name || truck.name,
      email: request.body.email || truck.email,
      description: request.body.description || truck.description,
      updated_at: rdb.now()
    };

    yelp.business(yelpID, function(error, data){
      updateTruck.yelpInfo = {
        url: request.body.yelpUrl || truck.yelpInfo.url,
        categories: data.categories,
        review_count: data.review_count,
        smallRating: data.rating_img_url_small,
        mediumRating: data.rating_img_url,
        largeRating: data.rating_img_url_large,
      }

      rdb.edit('trucks', truck.id, updateTruck)
      .then(function(){
        response.redirect('/trucks/' + request.params.id)
      })
    })
  });
});

//Helper method for calculating truck-user distance
function calcDistance(user, truck){
  var R = 6371; // Radius of the earth in km
  // console.log(user.position);
  var userLocation = JSON.parse(user.position);
  var truckLocation = JSON.parse(truck.location);
  console.log("************************************")
  console.log(truckLocation["lat"]);
  var dLat = deg2rad(truckLocation["lat"]-userLocation["lat"]);  // deg2rad below
  var dLon = deg2rad(truckLocation["lng"]-userLocation["lng"]); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(truckLocation["lat"])) * Math.cos(deg2rad(userLocation["lat"])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

//Helper method for sorting trucks by distance to user
function sortDistances(user, truckArray){
  var distanceArray = [];
  truckArray.forEach(function (truck){
    if(truck.location != null){
      var d = {id: truck.id, distance: calcDistance(user, truck)}
      distanceArray.push(d);
    }else{
      var d = {id: truck.id, distance: 10}
      distanceArray.push(d);
    }
  });
  distanceArray.sort(function (a, b){return a.distance - b.distance})
  return distanceArray;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

// 
var allTrucksArray = [];
function sortTrucks(distanceArray, user, favorites, session, response){
  distanceArray.forEach(function(distanceObject){
    rdb.find('trucks', distanceObject.id)
    .then(function (truck){
      console.log("IN THEN" + truck);
      allTrucksArray.push(truck);
      console.log(allTrucksArray);
      if(allTrucksArray.length == distanceArray.length){
        response.render('trucks/index', {title: 'All Trucks', allTrucks: allTrucksArray, currentUser: user, favorites: favoriteIds, session: session});
      }
    });
  });
}

module.exports = router;

