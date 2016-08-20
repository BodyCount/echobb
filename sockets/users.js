const log4js = require('log4js')
    , logger = log4js.getLogger("sockets:profile");

const db = require('../database')
    , socketController = require('./socketController');

module.exports = {

  get: function(username, socket){
    db.controller.findOne('User', {username: username, excludes: '-secret -hashedPassword'}, null,  (err, user) =>
    {
      if (err) return logger.error(err);
      var userSocket = socketController.getSocket(null, user.username)
        , currentlyOnline = userSocket? true:false;

      socket.emit('profile:set', {profile:user, status: currentlyOnline});
    })
  },

  getUsersOnline: function()
  {
    var sockets = socketController.getSockets();
    for (var k in sockets)
    {
      if (sockets[k].username)
        logger.debug(sockets[k].username)
    }
  }
}