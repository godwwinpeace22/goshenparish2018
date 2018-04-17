const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config(); // this dotenv will help me run my apps without heroku, and without commiting important files!!!
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoDB = process.env.database;
mongoose.connect(mongoDB);
db = mongoose.connection;
//bind connecton to error event(to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const multer = require('multer');
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    let arr = file.mimetype.split('/');
    let extension = arr[arr.length - 1];
    cb(null, file.fieldname + Date.now() + '.' + extension)
  }
})

const upload = multer({ storage: storage })
let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());
app.use(flash());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
})
app.use(require('express-session')({
  secret: 'whoyouareinchristJesus',
  resave: false,
  saveUninitialized: false,
  cookie:{maxAge: 60 * 60 * 1000},
  store: new MongoDBStore({
      uri: process.env.database,
      databaseName: 'faithtabernacle',
      collection: 'sessions'
    })
}));
app.use(compression()); //Compress all routes. 
app.use(helmet()) // secure site against known vunerabilities by setting appropriete headers

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// nodemon --signal SIGTERM --exec 'heroku local'