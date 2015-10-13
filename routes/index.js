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

/* GET home page. */
router.get('/', function(request, response, next) {
  response.redirect('/trucks')
    // response.render('index', { title: "Track My Truck", session: session });
});

router.post('/sendmsg', function(request, response, next){
  sendSMS('3172243309', 'test')
  response.redirect('/')
})

module.exports = router;
