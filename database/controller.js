"use strict";

const mongoose = require('mongoose')
		, log4js = require('log4js')
		, logger = log4js.getLogger("db:controller");


var Models = {
	Section: require('../models/section'),
	Discussion: require('../models/discussion'),
	Message: require('../models/message'),
	User: require('../models/user')
};

module.exports = { //TODO: bd validators

	createUser: function(userData, callback) { 
		var Model = Models['User'];

		Model.findOne({username: userData.username}, '-_id -__v', (err, result) =>
		{
			if (err) return logger.error(err)
			if (result) return callback('User with given name already exist')
			var colors = require('../libs/colors');
			var user = {
				username: userData.username,
				password: userData.password,
				color: colors.getRandomColor()
			};

			var model = new Model(user);
			model.save(function (err)
			{
				if (err) return logger.error(err)
				callback(null);
			});

		});
	},

	authUser: function(userData, callback){
		var User = Models['User'];

		User.findOne({username: userData.username}, (err, result) =>
		{
			if (err) return logger.error(err)
			if (!result) return callback('Can\'t find user')

			if (result.checkPassword(userData.password) === true){
				result.lastOnline = new Date();
				result.save(err => {
					if (err) return logger.error(err);
					callback(null, result);						
				});

			}
			else
				callback('Username or password is not correct');
		});
	},

	changeUserPermission: function(username, permission,callback){
		var User = Models['User'];

		User.findOne({username: username}, (err, result) =>
		{
			if (err) return logger.error(err)
			if (!result) return callback('Can\'t find user')

			result.permission = permission;
			result.save((err, saved) => 
			{
				if (err) return logger.error(err);
				callback(null);						
			});
		});
	},


	createSection: function(sectionData, callback){

		var Section = Models['Section'];
		var model = new Section(sectionData);
		logger.debug('createSection')
		model.save(function (err, schema)
		{
			if (err) return logger.error(err);
			callback(null);
		});

	},

	createDiscussion: function(searchOptions, authorUsername, discussionData, callback){

		var Section = Models['Section']
			, User = Models['User'];
		
		Section.findOne({id:searchOptions.id}, (err, result) =>
		{
			if (err) return logger.error(err)

			if (!result) return callback('Can\'t find any model')

			var discussions = result['discussions'];
			User.findOne({username: authorUsername}, (err, user) =>
			{
				if (err) return logger.error(err)
				if (!result) return callback('Can\'t find user')

				logger.debug(user);

				var discussion = {
					author: authorUsername,
					title: discussionData.title,
					color: user.color,
					replies: [{
						author: authorUsername, 
						body: discussionData.message, 
						number: 1
					}]
				};

				discussions.push(discussion);

				result.save((err, saved) =>
				{
					if (err) return logger.error(err)
					callback(null);
				});
			});



		});
		
	},

	getSectionDiscussions: function(searchOptions, embeddedDoc, callback){

		var Section = Models['Section'];

		var findKey = Object.keys(searchOptions)[0]
			, findParams = {};

		findParams[findKey] = searchOptions[findKey];

		var sortOption = (embeddedDoc)? embeddedDoc.embedded + '.' + searchOptions.sortField: searchOptions.sortField
			, skip = (searchOptions.page === -1)? 0:searchOptions.page * 10
			, limit = (searchOptions.page === -1)? 1: 10;

		logger.debug('skip is %s, limit is %s', skip, limit);
		Section.aggregate()
					 .match(findParams)
			 		 .unwind(embeddedDoc.embedded)
		       .sort('field -'+ sortOption)	
					 .skip(skip)
					 .limit(limit)
		.exec((err, result) => 
		{
			if (err) return logger.error(err);
			if (!result) return logger.error('Can\'t find any data'); 
			if (result.length == 0) return callback(null, result); 

			//работая с встроенными документами, мы "разрезаем" их с помощью unwind, и после собираем их обратно
			var discussions = [];
			for (var k in result)
				discussions.push(result[k][embeddedDoc.embedded]);
	
			return callback(null, discussions);
		});
	},

	updateDiscussion: function(searchOptions, reply, authorUsername, callback){

		var Section = Models['Section'];
		var User = Models['User'];
		Section.findOne({id:searchOptions.id}, (err, result) =>
		{
			if (err) return logger.error(err)
			if (!result) return callback('Can\'t find any model')
			User.findOne({username: authorUsername}, (err, user) =>
			{
				if (!user) return logger.error('User can not be find')
				var discussion = result['discussions'].id(searchOptions.discussion);
				var message = {author: authorUsername, color: user.color, body: reply.body, number: discussion.replies.length + 1};
				discussion.replies.push(message);

				result.save((err, saved) =>
				{
					if (err) return logger.error(err) 
					callback(null);
				});
			});

		});
	},


	getDiscussion: function(searchOptions, embeddedDoc, callback){ //need to create sort

		var Section = Models['Section'];

		var findKey = Object.keys(searchOptions)[0]
			, findParams = {};
		findParams[findKey] = searchOptions[findKey];

		var sortOption = (embeddedDoc)? embeddedDoc.embedded + '.' + searchOptions.sortField: searchOptions.sortField
			, skip = (searchOptions.page === -1)? 0:searchOptions.page * 10
			, limit = (searchOptions.page === -1)? 9999: 11;


		logger.debug('skip is %s, limit is %s', skip, limit);
		Section.aggregate()
					 .match(findParams)
		       .unwind('discussions')
		       .match({'discussions.id': embeddedDoc.id})
		       .unwind('discussions.replies')
				   .skip(skip)
					 .limit(limit)
		.exec((err, result) => 
		{
			if (err) return logger.error(err);
			if (!result) return logger.debug('Can\'t find any data');
			if (result.length == 0) return callback(null, result);
			var finalResult = result[0].discussions;
			var replies = []
			for (var i = 0; i < result.length; i++)
				replies.push(result[i].discussions.replies);

			finalResult.replies = replies;
			return callback(null, finalResult);

		});

	},

	find: function(schemaName, callback){

		if (!Models[schemaName]) 
			return logger.error('Can\'t find model with given name')

		var Model = Models[schemaName];

		Model.find({}, '-_id -__v', (err, data) =>
		{
			if (err) return logger.error(err)

			callback(null, data);
		});

	},

	findOne: function(schemaName, searchOptions, embeddedDoc, callback){ //change this function вернуть старый файндван, пайплайны не нужны

		if (!Models[schemaName]) return logger.error('Can\'t find model with given name');

		var Model = Models[schemaName];

		var findKey = Object.keys(searchOptions)[0]
			, excludeOptions = searchOptions.excludes? '-_id -__v '+ searchOptions.excludes : '-_id -__v'
			, findParams = {};

		findParams[findKey] = searchOptions[findKey];

		Model.findOne(findParams, (err, result) =>
		{
			if (err) return logger.error(err)

			if (!result) return callback('cant find anything')

			if (!embeddedDoc)
				callback(null, result);
			else
			{
				var founded = null;
				var eDoc = result[embeddedDoc.embedded];
				for (var i = 0; i < eDoc.length; i++)
					if (eDoc[i].id === embeddedDoc.id)
						founded = eDoc[i];

				if (founded)
					callback(null, founded);
				else
					callback(true);
			}

		});

	}

	

};

