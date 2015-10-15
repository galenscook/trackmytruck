var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var auth = require('../lib/auth');
var session = require('express-session');

router.put('/set-location', function (request, response){
  session.position = request.body.location;
  response.send('done');
});


module.exports = router;
