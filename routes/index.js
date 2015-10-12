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

// var currentUser = function(){
//   rdb.find('users', session.userID)
//   .then(function(user){
//   	return user;
//   })
// }


module.exports = router;
