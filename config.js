// var config = require('./config.js').get(process.env.NODE_ENV);

var config = {
    production: {
      session: {
        key: 'the.express.session.id',
        secret: 'Something.super.secret'
      },
      database: 'mongodb://godwinpeace22:godwinpeep@ds121248.mlab.com:21248/goshendb2018',
      gmail: {
        email: 'godwinpeace22@gmail.com',
        password: 'godwinpeep'
      },
      cloudinary: {
        cloud_name:'unplugged',
        api_key:'731267714782486',
        api_secret:'Gu66sJmc9U5sssmI9GkHYkNweqI'
      }
    },
    default: {
      session: {
        key: 'the.express.session.id',
        secret: 'something.super.secret'
      },
      database: 'mongodb://godwinpeace22:godwinpeep@ds121248.mlab.com:21248/goshendb2018',
      gmail: {
        email: 'godwinpeace22@gmail.com',
        password: 'godwinpeep'
      },
      cloudinary: {
        cloud_name:'unplugged',
        api_key:'731267714782486',
        api_secret:'Gu66sJmc9U5sssmI9GkHYkNweqI'
      }
  }
}
  
  exports.get = function get(env) {
    return config[env] || config.default;
  }