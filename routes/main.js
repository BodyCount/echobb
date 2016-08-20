const	path = require('path')
		, db = require('../database')
		, log4js = require('log4js')
		, logger = log4js.getLogger("routes:main")

var options = {
	root: path.join(__dirname, '../public')
};


module.exports = {

	get: function(req, res){
		res.sendFile('index.html', options, function(err)
		{
			if (err) {
				logger.error(err);
				res.status(err.status).end();
			}
		});
	}


};



