const log4js = require('log4js')
		, logger = log4js.getLogger("sockets:socketController")
		, socketController = require('./socketController')
    , tokens = require('../libs/tokens');

var connectedSockets = {};

/* map of socket in socket controller

socket = {
	state: { room: {room: string, page: string}}, 
	username: string, 
	auth: bool,
	subs: {sections: bool, 
					section: bool, 
					discussion: bool}

}
*/
var connectToRoom = function(socket, room)
{
	logger.debug('connect to room');
	socket.join(room);
	connectedSockets[socket.id].state[room] = {room: room, page: 1};	
}

var reassignRoom = function(socket, room)
{
	logger.debug('room reassign');
	socket.leave(connectedSockets[socket.id]);
	socket.join(room);

	connectedSockets[socket.id].state[room] = {room: room, page:1};	
}

module.exports = {

	setSocket: function(socketId){ 
		connectedSockets[socketId] = {};
		connectedSockets[socketId].state = {}
	},

	getSocket: function(socketId, username) {
		if (username)
		{
			var found;
			for (var k in connectedSockets)
				if (connectedSockets[k].username === username)
					found = connectedSockets[k];
			if (found)
				return found
			else 
				return null
		}
		else
			return connectedSockets[socketId];
	},

	getSockets: function(){
		return connectedSockets;
	},

	deleteSocket: function(socketId){
		delete connectedSockets[socketId];
	},

	authSocket: function(token, socket){
		if (token == null)
			return logger.warn('token is null');
		tokens.checkToken(token, (err, decodedToken) => {
			if (err) return logger.debug(err);

		  connectedSockets[socket.id].username = decodedToken.sub;
		  connectedSockets[socket.id].permission = decodedToken.permission;
		  connectedSockets[socket.id].auth = true;
		  socket.emit('auth:setAuth', {username:decodedToken.sub, permission: decodedToken.permission});
		});		
	},

	changeAuth: function(socketId) { // this function has no use?
		connectedSockets[socketId].auth = !(connectedSockets[socketId].auth);
	},

	joinRoom: function(socket, room){

		if (!connectedSockets[socket.id].state[room])
			connectToRoom(socket, room);
		else {
			if (connectedSockets[socket.id] == room) return logger.info('user in same room')
			reassignRoom(socket, room);
		}
	}
	
}

