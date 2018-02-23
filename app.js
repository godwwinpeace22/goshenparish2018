let express = require('express');
let path = require('path');
//require('dotenv').config();
let favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
//const config = require('./config.js').get(process.env.NODE_ENV);
var configure = require('config');
const mongoose = require('mongoose');
const mongoDB = 'configure.get('database')';
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
