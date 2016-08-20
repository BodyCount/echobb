"use strict";

const db = require('../database')
		, log4js = require('log4js')
		, logger = log4js.getLogger("sockets:sections")
		, socketController = require('./socketController');

var io;

var sendSections = function (socket) {
	db.controller.find('Section', (err, result) => {
		if (err) logger.warn(err);
		
		if (socket)
			socket.emit('sections:update', result);
		else
			io.to('/').emit('sections:update', result);
	});
};

var createSections = function(section){
	db.controller.createSection(section, (err) => 
	{
		if (err) return logger.error(err)
		sendSections();
	});
};

module.exports.subscribe = function(_io, socket){

	io = _io;

	socketController.joinRoom(socket, '/');
	sendSections(socket);

	if (!socket._events['sections:create'])
		socket.on('sections:create', section => //TODO: add  data  validators
		{
			if (socketController.getSocket(socket.id).auth && socketController.getSocket(socket.id).permission == 2)
				createSections(section);
			else
				socket.emit('sections:error', 'You dont have permissions');
		});

};