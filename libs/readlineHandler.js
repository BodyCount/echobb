const readline = require('readline')
	  , db = require('../database')
		, log4js = require('log4js')
		, logger = log4js.getLogger("readline:handlers")

module.exports = {

	init: function(){
		const rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});

		rl.on('line', (cmd) =>  //permission *username* *permission*
		{
			var split = cmd.split(' ');
			if (split[0] === 'permission')
				db.controller.changeUserPermission(split[1], split[2], (err) =>
				{
					if (err) return logger.error(err)
					logger.debug('permission changed');
				});
			else
				logger.warn('unknow command');
		});
	}


};