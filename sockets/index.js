"use strict";
const log4js = require('log4js')
	  , logger = log4js.getLogger("sockets");

const db = require('../database')
		, socketController = require('./socketController');

var socketModules = {
	sections: require('./sections'),
	section: require('./section'),
	users: require('./users')
};

module.exports = function(io) {

	io.on('connection', socket =>
	{
		logger.debug('connection');
		socketController.setSocket(socket.id);

		if (socket.request.session && socket.request.session.hasOwnProperty('token'))
			socketController.authSocket(socket.request.session.token, socket);			

		socket.on('main:subscribe', connectInfo => //create listening removers
		{
			socketModules.sections.subscribe(io, socket);
		});

		socket.on('section:subscribe', connectInfo => //create listening removers
		{
			socketModules.users.getUsersOnline();
			if (connectInfo.section)
				socketModules.section.subscribeToSection(io, socket, connectInfo.section);
			else
				socket.emit('section:error', 'bad request');
		});

		socket.on('discussion:subscribe', connectInfo => //create listening removers
		{
			if (connectInfo.route)
				socketModules.section.subscribeToDiscussion(io, socket, connectInfo.route);
			else
				socket.emit('discussion:error', 'bad request');
		});

		socket.on('profile:get', username =>
		{
			socketModules.users.get(username, socket);
		});

		socket.on('users:getOnline', () =>
		{

		});

		socket.on('disconnect', () =>
		{
			socketController.deleteSocket(socket.id);
		})
	});

};