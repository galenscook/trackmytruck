var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var session = require('express-session')

/* GET home page. */
router.get('/', function(request, response, next) {
  response.redirect('/trucks')
    // response.render('index', { title: "Track My Truck", session: session });
});

module.exports = router;
