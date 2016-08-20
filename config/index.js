var crypto = require('crypto');
module.exports = {
	'server':{
		'port': 3000
	},
	'database':{
		'url': 'mongodb://localhost/test'
	},

  'jwt': {
  	'secret': 'wow',//crypto.randomBytes(128).toString('hex'),
  	'expiryTime': '3d'
	},
  'session':{
  	'secret': 'wubdabubda',
  	'cookie':{
  		'httpOnly': true,
  		'maxAge': null
  	}
  }
};