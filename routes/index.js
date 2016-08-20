module.exports = function(app)
{
	app.get('/', require('./main').get);

  app.post('/create', require('./auth').createUser);
  app.post('/login', require('./auth').loginUser);
  app.post('/logout', require('./auth').logoutUser);

  //app.get('/profile/:username', require('./profile').get);
};