var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
// var auth = require('../lib/auth');
var session = require('express-session')

/* GET home page. */
router.get('/', function(request, response, next) {
    // console.log(currentUser);
    console.log(session)
    response.render('index', { title: "Track My Truck", session: session });
});
// router.get('/', function(request, response, next) {
//   var newUser = {
//               name: "Steve",
//               email: "steve@yahoo.com",
//               password: "password"
//           };

//           rdb.save('users', newUser)
//           .then(function (result) {
//               console.log(newUser)
//               response.render('index', {title: (newUser.name)});
//               // console.log(response)
//           });


//   // res.render('index', { title: 'Express' });
// });

// router.get('/:id', function (request, response, next) {
//     rdb.find('users', request.params.id)
//     .then(function (user) {
//         if(!user) {
//             var notFoundError = new Error('User not found');
//             notFoundError.status = 404;
//             return next(notFoundError);
//         }
//         console.log(user)
//         response.json(user);
//     });
// });



module.exports = router;
