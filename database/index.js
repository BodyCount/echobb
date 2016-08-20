"use strict";

var mongoose = require('mongoose')
		, log4js = require('log4js')
		, logger = log4js.getLogger("db");

var config = require('../config').database;

module.exports = {

	controller: require('./controller'),

	connect: function() {
		mongoose.connect(config.url);

		mongoose.connection.on('error', err =>
		{
			logger.error('Connection error:', err);
		});

		mongoose.connection.once('open', () => 
		{
			logger.info('Connected to %s', config.url);
		});
		return mongoose.connection;
	},

	wipe: function(){
		mongoose.connect(config.url, () =>
		{
			mongoose.connection.db.dropDatabase();
			logger.warn('db %s was wiped', config.url);
		});
	}

};