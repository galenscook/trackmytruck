var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');

function calcDistance(session, truck){
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(truck.position["J"]-session.position["J"]);  // deg2rad below
  var dLon = deg2rad(truck.position["M"]-session.position["M"]); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(truck.position["J"])) * Math.cos(deg2rad(-37.784998)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function sortDistances(truckArray){
  var distanceArray = [];
  var session = {};
  truckArray.forEach(function (truck){
    var d = {id: truck.id, distance: calcDistance(truck)}
    distanceArray.push(d);
  });
  // distanceArray.sort(function(a, b){return a-b});
  distanceArray.sort(function (a, b){return a.distance - b.distance})
  return distanceArray;
}

function sortTrucks(distanceArray){
  var allTrucksArray = [];
  distanceArray.forEach(function(distanceObject){
    rdb.find('trucks', distanceObject.id)
    .then(function (truck){
      allTrucksArray.push(truck);
    });
  });
  return allTrucksArray;
}

// var truck3 = {
//   id: 443102236,
//   position: {"J": 36.782039, "M": -122.401001}
// }
// var truck4 = {
//   id: 086897335,
//   position: {"J": 37.785227, "M": -122.400518}
// }
// var truck5 = {
//   id: 125086736,
//   position: {"J": 37.782039, "M": -122.401001}
// }
// var truckArray = [truck3, truck5, truck4]

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
      // Add the below 3 lines after truck distance issues are resolved
      // and user location is stored in session
      // var allDistances = sortDistances(session, trucks); 
      // var allTrucksArray = sortTrucks(allDistances);
      // response.render('trucks/index', {title: 'All Trucks', allTrucks: allTrucksArray, currentUser: null, session: session});    
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
  auth.hash_password(request.body.password)
  .then(function (hash) {
    var newTruck = {
      name: request.body.name,
      email: request.body.email,
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

        console.log(updateTruck);

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

