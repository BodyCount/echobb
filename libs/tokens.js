const jwt = require('jsonwebtoken')
    , config = require('../config');

module.exports = {

	createToken: function(subject){
    return jwt.sign({sub: subject.username, iss: 'localhost:3000', permission: subject.permission}, config.jwt.secret,  {expiresIn: config.jwt.expiryTime});
	},

	checkToken: function(token, callback){
		jwt.verify(token, config.jwt.secret, function(err, decoded) {
		  if (err) return callback(err);
		  callback(null, decoded);
		});
	}

}