/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
const polyfills = require('./polyfills')();



/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const importController = require('./controllers/import-pre-defined-projects');
const projectController = require('./controllers/project');
/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();


hbs({
    // Specify helpers which are only registered on this instance.
    helpers: {
        equal: function(a, b, opts) {
            if(a == b) // Or === depending on your needs
                return opts.fn(this);
            else
                return opts.inverse(this);
        },
        "raw-helper": function(options) {
          return options.fn();
        }
    }
});

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    //lusca.csrf()(req, res, next);
    next();
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, '/public'), { maxAge: 0 }));


/**
 * Project routes.
 */

app.get('/api/v1/projects/all', projectController.getProjects);
app.get('/api/v1/projects/import', importController.importProjects);
app.get('/api/v1/projects/delete', projectController.removeProjects);
app.get('/api/v1/projects/predefinedtags', importController.addPredefinedTagsToPredefinedProjects);
app.get('/api/v1/projects/addTag', projectController.addTagToProjects);

app.get('/*', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/api/v1/authenticate', function (req, res) {
  console.log(req.body.password);
  if (req.body.password == 'testpw') {
    res.status(200).json({status: 'success'});
  } else {
    res.status(200).json({status: 'failed'});
  }
});


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
