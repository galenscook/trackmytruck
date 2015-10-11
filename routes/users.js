var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session')

// New User Form

router.get('/new', function(request, response, next) {
    // console.log(currentUser());
    console.log(session.userID);
    var user = currentUser();
    console.log(user);
    response.render('users/new');
});

// Show User Login Form

router.get('/login', function (request, response, next){
    // console.log(session)
    response.render('users/login');
})

router.get('/logout', function (request, response, next){
    // console.log(session)
    session.userID = null;
    response.redirect('/');
})
// Login User

router.post('/login', function (request, response, next) {
    rdb.findBy('users', 'email', request.body.email)
    .then(function (user) {
        user = user[0];

        if(!user) {
            // var userNotFoundError = new Error('User not found');
            // userNotFoundError.status = 404;
            // return next(userNotFoundError);
            response.redirect('/users/login');
        }

        auth.authenticate(request.body.password, user.password)
        .then(function (authenticated) {
            if(authenticated) {
              session.userID = user.id;
                // var currentUser = {
                //     name: user.name,
                //     email: user.email,
                //     token: token.generate(user)
                // };
                // console.log(currentUser);
                response.redirect('/users/'+session.userID); 
            } else {
                var authenticationFailedError = new Error('Authentication failed');
                authenticationFailedError.status = 401;
                return next(authenticationFailedError);
            }
        });
    });
});

router.get('/magic', function (request, response, next){
  rdb.find('users', session.userID)
  .then(function(user){
    // currentUser = user;
    // console.log(currentUser());
    response.render('users/login');
  });
})
// Show User Profile

router.get('/:id', function (request, response, next) {
  rdb.find('users', request.params.id)
  .then(function (user) {
    if(!user) {
      var notFoundError = new Error('User not found');
      notFoundError.status = 404;
      return next(notFoundError);
    }
    // var favorites = rdb.favorites(user.id).toArray();
    // console.log(favorites)
    // response.render('users/show', {user: user, favorites: favorites})
    rdb.favorites(user.id)
    .then(function (favorites) {
      console.log("MADE IT HERE")
      response.render('users/show', {user: user, favorites: favorites});

      })
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
        response.redirect('/users/'+users[0].id)
      })

    });
  });
});

module.exports = router;
