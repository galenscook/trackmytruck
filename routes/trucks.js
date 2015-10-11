var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');


// View all trucks

router.get('/', function(request, response, next){
  rdb.findAll('trucks')
  .then(function (trucks){
    response.render('trucks/index', {allTrucks: trucks})
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
      yelpUrl: request.body.email,
      password: hash,
      updated_at: rdb.now()
    };

    rdb.save('trucks', newTruck)
    .then(function (result) {
      rdb.findBy('trucks', 'yelpUrl', newTruck.yelpUrl)
      .then(function(trucks){
        var currentTruck = trucks[0]
        currentTruck.token = token.generate(currentTruck)
        response.redirect('/trucks/'+trucks[0].id)
      })

    });
  });
});


module.exports = router;