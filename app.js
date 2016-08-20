//external modules
const express = require('express')
		, bodyParser = require('body-parser')
		, methodOverride = require('method-override')
		, log4js = require('log4js')
		, session = require('express-session')
	  , MongoStore = require('connect-mongo')(session)
	  , readline = require('./libs/readlineHandler');

const app = express()
	  , server = require('http').Server(app)
		, io = require('socket.io')(server);

app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use('/static', express.static('public'));
logger = log4js.getLogger("app");
readline.init();

//project modules
const	config = require('./config')
		, db = require('./database')

var mongooseConnection = db.connect();
//db.wipe();

var sessionMiddleware = session({
	secret: config.session.secret,
	cookie: config.session.cookie,
  store: new MongoStore({ mongooseConnection: mongooseConnection})
});

app.use(sessionMiddleware);
io.use(function(socket, next) {
  sessionMiddleware(socket.request, socket.request.res, next);
});

const routes = require('./routes')(app)
		, sockets = require('./sockets')(io);

server.listen(config.server.port, function()
{
	logger.info('Server is running on port %s', config.server.port);
});

