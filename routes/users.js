var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var token = require('../lib/token');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });


// auth.authorize,

// New User Form

router.get('/new', function(request, response, next) {
    response.render('users/new');
});


// Show User Profile

router.get('/:id', auth.authorize, function (request, response, next) {
  rdb.find('users', request.params.id)
  .then(function (user) {
    if(!user) {
      var notFoundError = new Error('User not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    response.render('users/show', {user: user});
  });
});

// Creates new user in database
router.post('/', function (request, response) {
  auth.hash_password(request.body.password)
  .then(function (hash) {
    var newUser = {
      name: request.body.name,
      email: request.body.email,
      cell: request.body.cell,
      password: hash,
      updated_at: rdb.now()
    };

    rdb.save('users', newUser)
    .then(function (result) {
      rdb.findBy('users', 'email', newUser.email)
      .then(function(users){
        var currentUser = users[0]
        currentUser.token = token.generate(currentUser)
        console.log(response)
        response.redirect('/users/'+users[0].id)
      })

    });
  });
});

module.exports = router;
