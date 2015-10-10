var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');

// New Truck Form

router.get('/new', function(request, response, next) {
    response.render('trucks/new');
});


// Show Truck Profile

router.get('/:id', auth.authorize, function (request, response, next) {
  rdb.find('trucks', request.params.id)
  .then(function (user) {
    if(!user) {
      var notFoundError = new Error('User not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    response.render('trucks/show', {user: user});
  });
});

// Creates new truck in database  **ADD IN PHOTO AND YELP AND CATEGORIES
router.post('/', function (request, response) {
  auth.hash_password(request.body.password)
  .then(function (hash) {
    var newTruck = {
      name: request.body.name,
      description: request.body.description,
      email: request.body.email,
      password: hash,
      updated_at: rdb.now()
    };

    rdb.save('trucks', newTruck)
    .then(function (result) {
      rdb.findBy('trucks', 'email', newTruck.email)
      .then(function(trucks){
        var currentTruck = trucks[0]
        currentTruck.token = token.generate(currentTruck)
        response.redirect('/trucks/'+trucks[0].id)
      })

    });
  });
});


module.exports = router;