var express = require('express');
var router = express.Router();
var rdb = require('../lib/rethink');
var session = require('express-session')


// Twilio 
var twilio = require('twilio')
var twilioSID = process.env.TWILIO_SID
var twilioToken = process.env.TWILIO_TOKEN
var client = twilio(twilioSID, twilioToken)
var twilioNumber = process.env.TWILIO_NUMBER

var sendSMS = function(to, msg, callback){
  console.log("sending: ", to, msg)
  client.sms.messages.create({
    body: msg,
    to: to,
    from: twilioNumber}, 
    function(err, sms) {
        if (callback) callback;
    });
}

function calcDistance(user, truck){
  var R = 6371; // Radius of the earth in km
  // console.log(user.position);
  var userLocation = JSON.parse(user.position);
  var truckLocation = JSON.parse(truck.location);
  console.log("************************************")
  console.log(truckLocation["lat"]);
  var dLat = deg2rad(truckLocation["lat"]-userLocation["lat"]);  // deg2rad below
  var dLon = deg2rad(truckLocation["lng"]-userLocation["lng"]); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(truckLocation["lat"])) * Math.cos(deg2rad(userLocation["lat"])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

/* GET home page. */
router.get('/', function(request, response, next) {
  response.redirect('/trucks')
    // response.render('index', { title: "Track My Truck", session: session });
});

router.get('/sendmsg/:id', function(request, response, next){
  rdb.find('trucks', request.params.id)
  .then(function(truck){
    rdb.findFanNumbers(truck.id)
    .then(function(fans){
      if(fans.length === 0){
        response.redirect('/')
      }
      else{
        fans.forEach(function(fan){
          // if(calcDistance(fan, truck) <= 2){
            sendSMS(fan.cell, truck.name+' just opened near you!')
          // }
        })
        response.redirect('/')
      }
    })
  })
  // console.log(currentTruck)
  // sendSMS('3172243309', 'test')
  // response.redirect('/')
})

module.exports = router;
