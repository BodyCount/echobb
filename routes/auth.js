const log4js = require('log4js')
    , logger = log4js.getLogger("routes:auth")
    , session = require('express-session')
    , mongoStore = require('connect-mongo')(session);

const db = require('../database')
    , tokens = require('../libs/tokens');

module.exports = {

  createUser: function(req, res){
    if (req.body.username && req.body.password)
    {
      var userInfo = {username: req.body.username, password: req.body.password};

      db.controller.createUser(userInfo, err => {
        if (err) {res.json({'error':'User with given name already exist'});return;}
        res.json({'message':'User created'});
      });
    }
    else
      res.sendStatus(400);
  },

  loginUser: function(req, res){
    if (req.body.username && req.body.password)
    {
      var userInfo = {username: req.body.username, password: req.body.password};  

      db.controller.authUser(userInfo, (err, user) => {
        if (err) {res.json({'error':'Incorrect username or password'});return;}
        req.session.token = tokens.createToken({'username': user.username, 'permission': user.permission});
        res.json({'username': user.username, 'permission': user.permission});
      });
    }  
  },

  logoutUser: function(req, res){
    req.session.destroy();    
    res.sendStatus(200);
  }
};
