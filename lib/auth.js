var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var token = require('./token');



// Function that grabs token from params and calls the verify function to validate

module.exports.authorize = function (request, response, next) {
    var apiToken = request.headers['x-api-token'];
    token.verify(apiToken, next);
    next();
};

// Hashing a password
module.exports.hash_password = function (password) {
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (error, salt) {
      if(error) return reject(error);

      bcrypt.hash(password, salt, function (error, hash) {
        if(error) return reject(error);
        return resolve(hash);
      });
    });
  });
};

// Check a user's password
module.exports.authenticate = function (password, hash) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, hash, function (error, response) {
      if(error) return reject(error);
      return resolve(response);
    });
  });
};