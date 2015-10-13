var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');

// New User Form
router.get('/new', function(request, response, next) {
    response.render('users/new', {title: 'Sign Up', session: session});
});

// Show User Login Form
router.get('/new', function (request, response, next){
    response.render('users/login', {title: 'Login', session: session});
})

// Logout User
router.get('/logout', function (request, response, next){
  session.userID = null;
  session.userType = null;
  response.redirect('/');
})

// Login User
router.post('/login', function (request, response, next) {
  rdb.findBy('users', 'email', request.body.email)
  .then(function (user) {
    user = user[0];

    if(!user) {
      response.redirect('/users/login');
    }

    auth.authenticate(request.body.password, user.password)
    .then(function (authenticated) {
      if(authenticated) {
        session.userID = user.id;
        console.log(session);
        session.userType = 'user';
        response.redirect('/users/'+session.userID);
      } else {
          var authenticationFailedError = new Error('Authentication failed');
          authenticationFailedError.status = 401;
          return next(authenticationFailedError);
      }
    });
  });
});

// Store user location from map
router.put('/set-location', function (request, response){
  console.log(session)
  if(session.userID != undefined){
    rdb.find('users', session.userID)
    .then(function(user){
      var updateUser = {
        name: user.name,
        email: user.email,
        cell: user.cell,
        position: request.body.location
      }

      rdb.edit('users', user.id, updateUser)
      .then(function(){
        response.send('done')
      })
    })
  } else {
    response.send('done')
  }
});

// Send truck info to map
router.get('/get-truck-info', function (request, response){
  rdb.findAll('trucks')
  .then(function(trucks){
    response.json(trucks);
  })
})

// Show User Profile
router.get('/:id', function (request, response, next) {
  if(request.params.id == session.userID){
    rdb.find('users', request.params.id)
    .then(function (user) {
      if(!user) {
        var notFoundError = new Error('User not found');
        notFoundError.status = 404;
        return next(notFoundError);
      }
      rdb.favorites(user.id)
      .then(function (favorites) {
        response.render('users/show', {title: user+"'s Profile", user: user, favorites: favorites, session: session});
      })
    });
  } else {
    response.redirect('/')
  }
});

// Edit profile page
router.get('/:id/edit', function(request, response, next){
  if (request.params.id == session.userID){
    rdb.find('users', request.params.id)
    .then(function(user){
      response.render('users/edit', {title: user.name+"'s Profile", user: user, session: session})
    });
  } else {
    response.redirect('/')
  }
});

// Update profile
router.put('/:id', function(request, response){
  rdb.find('users', request.params.id)
  .then(function(user){
    var updateUser = {
      name: request.body.name || user.name,
      email: request.body.email || user.email,
      cell: request.body.cell || user.cell
    };

    rdb.edit('users', user.id, updateUser)
    .then(function(){
      response.redirect('/users/' + request.params.id)
    })
  });
});

// Creates new user in database
router.post('/', function (request, response) {
  auth.hash_password(request.body.password)
  .then(function (hash) {
    var newUser = {
      name: request.body.firstName+' '+request.body.lastInitial,
      email: request.body.email,
      cell: request.body.cell,
      password: hash,
      updated_at: rdb.now()
    };

    rdb.save('users', newUser)
    .then(function (result) {
      rdb.findBy('users', 'email', newUser.email)
      .then(function(users){
        session.userID = users[0].id;
        session.userType = 'user';
        response.redirect('/users/'+users[0].id)
      })
    });
  });
});


module.exports = router;
