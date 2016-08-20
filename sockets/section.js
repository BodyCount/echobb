"use strict";
const db = require('../database')
		, log4js = require('log4js')
		, logger = log4js.getLogger("sockets:section")
		, socketController = require('./socketController');

var io;
var section, discussion;

var sectionIsExist = function (callback) {
	db.controller.findOne('Section', {id:section}, null, (err, result) =>
	{
		if (err) return callback('Can\'t find section')
		callback(null);
	});
}

var sendSectionDiscussions = function (socket, page) {
	db.controller.getSectionDiscussions( {id:section,  sortField: 'lastMessageDate', excludes: ['replies'], page: page}, {embedded: 'discussions'}, (err, discussion) => {
		if (err) return logger.error(err)
			

		if (socket)
			socket.emit('section:update', {discussions: discussion});			
		else
			io.to(section).emit('section:update', {hasNew: true, discussions: discussion});
	});
};

var saveDiscussion = function(discussion, authorUsername, callback){
	db.controller.createDiscussion({id:section}, authorUsername, discussion, err => {
		if (err) return callback(err);
		callback(null);
	});
};

var discussionIsExist = function (callback) {
  db.controller.findOne('Section', {'id': section}, {embedded: 'discussions', id: discussion}, 
    (err, result) => {
    if (err) return callback('Can\'t find discussion')
    callback(null);
  });
};

var sendDiscussion = function (socket, page) {
  db.controller.getDiscussion({'discussions.id':discussion, sortField: 'creationDate', page: page}, {embedded: 'replies', id: discussion}, 
    (err, discussion) => {
      if (err) return logger.error(err)
		logger.debug(discussion);
      if (socket)
        socket.emit('discussion:update', {discussion: discussion});
      else
        io.to(section).emit('discussion:update', {hasNew: true, discussion: discussion});
  });
};

var saveReply = function(reply, authorUsername, callback){
  db.controller.updateDiscussion({id:section, discussion: discussion}, reply, authorUsername, (err) => {
    if (err) return logger.error(err)
    callback(null);
  });
};

var createSectionListeners = function(socket){

	socketController.joinRoom(socket, section);
	sendSectionDiscussions(socket, 0);

	if (!socket._events['discussion:create'])
	socket.on('discussion:create', discussion => //TODO: add  data  validators
	{
		if (socketController.getSocket(socket.id).auth)
		{
			if (!discussion) return; //TODO: this is bad validator
			if (!discussion.title) return;
			if (!discussion.message) return;

			saveDiscussion(discussion, socketController.getSocket(socket.id).username, (err) =>
			{
				if (err) return logger.error(err)
				sendSectionDiscussions(null, -1);
			});
		}
		else
		{
			logger.warn('Someone trying to create discussion without authorization');
			socket.emit('section:error', 'You need to login');
		}
	});

	if (!socket._events['section:loadMore'])
	socket.on('section:loadMore', page =>
	{
		logger.debug(page);
		sendSectionDiscussions(socket, page);		
	});

};

var createDiscussionListeners = function(socket){

  socketController.joinRoom(socket, section);

  sendDiscussion(socket, 0);

  if (!socket._events['reply:create'])
    socket.on('reply:create', reply => //TODO: add  data  validators
    {
      if (!reply) return;
      if (!reply.body) return;
      if (socketController.getSocket(socket.id).auth){
        saveReply(reply, socketController.getSocket(socket.id).username, () =>
        {
          sendDiscussion(null, -1);  
          sendSectionDiscussions(null, -1);       
        });
      }
      else{
        logger.warn('Someone trying to create reply without authorization');
        socket.emit('discussion:error', 'You need to login');
      }
    });

  if (!socket._events['discussion:loadMore'])
    socket.on('discussion:loadMore', page =>
    {
      logger.debug(page);
      sendDiscussion(socket, page);    
    });
};

module.exports = {

	subscribeToSection: function(_io, socket, route){

		io = _io;
		section = route;
		sectionIsExist((err, result) => 
		{
			if (err) return socket.emit('section:error', err); 
			createSectionListeners(socket);
		});
	},

	subscribeToDiscussion: function(_io, socket, route){
	  io = _io;
	  if (route.section && route.discussion){
	    section = route.section;
	    discussion = route.discussion;
	  }
	  else 
	    return logger.warn('Route value for discussion is not valid');

	  discussionIsExist((err, result) => 
	  {
	    if (err) return socket.emit('discussion:error', err)
	    createDiscussionListeners(socket);
	  });
	}
}
