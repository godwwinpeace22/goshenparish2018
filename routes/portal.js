const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const Member = require('../models/member');
const Unhashpin = require('../models/unhashpin');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const Random = require("random-js");
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret
});

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'rccgportal',
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    cb(undefined, 'imgSrc' + Date.now());
  }
});

let upload = multer({ storage: storage });

//restrict accces to not-loggedin users
let restrictAccess = function(req,res, next){
	if(req.user){
	  next();
	}
	else{
    //req.flash('info', 'You must be logged in to perform this action');
    console.log(req.originalUrl);
	  res.render(`login` , {returnTo:req.originalUrl});
	}
}

// route requires user to be loggedout
let requireLogout = function(req,res,next){
  if(req.user){
    res.redirect('/portal'); // Redirect to the dashbaord if the user is aleady logged in
  }
  else{
    next()  // Run the next middleware if the user is logged in
  }
}

//allow access to Master only.
let masterLogin = function(req,res,next){
  bcrypt.compare(process.env.masterPassword,req.user.password,  function(err, response) {
    if(err) throw err;
    console.log(process.env.masterPassword)
    console.log(req.user.password)
    console.log(response);
    // res === true || res === false
    if(req.user.username === process.env.masterUsername && response === true){
      next();
    } 
    else{
      res.render('login');
    }
  }); 
}

// Handle Application Level Errors
function handleErrors(err,redirectTo,req,res,next){ // if errors happen within the app
  if(process.env.atm == 'development'){ // throw the errors while in development
    throw err
  }
  else if(process.env.atm == 'production'){
    req.flash('error', 'Sorry, An Unknown error Occurred')  // flash error message and reload to redirect url. Never crash the app by throwing errors
     res.redirect(redirectTo);
  }
  else{
    next()
  }
}


/* GET home page. */
router.get('/', restrictAccess, function(req, res, next) {
  User.findOne({_id:req.user.id}).
  populate('memberRef').
  exec((err,user)=>{
    //console.log(user);
    res.render('main', {
      title: 'Welcome To Your Portal',
      user:user
    });
  })
});


// === REGISTER NEW MEMBERS/PARTICIPANTS ===
router.get('/register', restrictAccess,  (req,res,next)=>{
    req.user.populate('memberRef', function(err,user){
      console.log(user);
      if(req.user.memberRef != null){ // If a user is already registered and tries to access this route
        req.flash('info', 'You have already been registered!')
        res.redirect('/portal'); //redirect him to the portal homepage
      }
      else{
        res.render('register', {
          title:'Registeration Form',
          user:user
        })
      }
      
    })
});

// GET CREATE ACOUNT VIEW
router.get('/new', (req, res) => {
  res.render('createacc', {title:'Create Account'});
});

// Create New Account
router.post('/new', requireLogout, function(req,res,next){
  req.checkBody('name', 'Please provide your full name').notEmpty();
  req.checkBody('username', 'Please provide a username').notEmpty();
  req.checkBody('pin', 'Please provide your pin').notEmpty();
  req.checkBody('password', 'password cannot be empty').notEmpty();
  req.checkBody('password2', 'passwords do not match').equals(req.body.password);
  
  //create a new user
  let user = new User({
    name: req.body.name,
    username:req.body.username,
    password: req.body.password,
    pin:req.body.pin,
    memberRef:null
  });
  
  //Run the validators
  let errors = req.validationErrors();
  
  //if there are errors in the form
  if(errors){
    res.render('createacc',  {
      title: 'Create Account',
      errors: errors,
      user:user
    });
    return;
  }
  
  //there are no errors
  else{
    //check if ther username is already taken
    User.findOne({'username': req.body.username}, function(err, result){
    if(err){return next(err)}

    //if the username is truely already in user by another user
    if(result){
      console.log('username is already taken');
      req.flash('error', 'Sorry, username is already taken');
      res.render('createacc',{
      title:'Create Account',
      user:user
      });
    }
  
    //the username is not taken
    else{
      // check if the pin is correct
      Unhashpin.findOne({_id:'5ad7b5c945bfa70014dcde59'},(err,thePin)=>{
        console.log(req.body.pin.toString());
        if(err) handleErrors(err,'/new');
        console.log(thePin)
        if(thePin.pin.indexOf(req.body.pin.toString()) === -1){
          console.log(thePin.pin.indexOf(req.body.pin.toString()))
          req.flash('error', 'Incorrect pin')
          res.render('createacc',{
            title:'Create Account',
            user:user
          });//300416879771
        }
        else{
          console.log(thePin.pin.indexOf(req.body.pin.toString()))
          bcrypt.hash(user.password, 10, function(err, hash){
            if(err) handleErrors(err,'/new')
            //set hashed password
            user.password = hash;
            user.save(function(err){
              if(err){return next(err)}
              // delete the pin
              let foo = thePin.pin
              foo.splice(foo.indexOf(req.body.pin),1)
              Unhashpin.update({_id:'5ad7b5c945bfa70014dcde59'},{pin:foo},(err,done)=>{ // update the pin array
                //res.redirect('/users/login');
                req.login(user, function(err) {
                  if (err) { return next(err); }
                  req.flash('success', 'Account created successfully')
                  return res.redirect('/portal/register');
                });
              })
            });
          })
        }
      })
      
    } 
    });
  }
  });


  //handle login route
passport.serializeUser(function(user, done){
  done(null, user.id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});
passport.use(new LocalStrategy(
  function(username, password, done){
    User.findOne({username: username}, function(err, user){
      if(err) {return done(err)}
      if(!user){
        console.log('incorrect username');
        return done(null, false, {message: 'Incorrect username.'});
      }
      bcrypt.compare(password, user.password, function(err, res) {
        if(err) handleErrors(err, '/portal');
        console.log(res);
        // res === true || res === false
        if(res !== true){
        return done(null, false, {message: 'Incorrect password.'});
        }
        else{
        console.log('user has been successfully authenticated');
        return done(null, user);
        }
      });
    });
  }
));

// POST == REGISTER NEW MEMBERS/PARTICIPANT
router.post('/register', restrictAccess, upload.single('imgSrc'), (req,res,next)=>{
  // Run Validation
  //req.checkBody('imgSrc', 'Please provide a valid image').notEmpty();
  req.checkBody('email', 'Email field cannot be empty').notEmpty();
  req.checkBody('email', 'Please provide a vilid email address').isEmail();
  req.checkBody('parish', 'pasish cannot be empty').notEmpty();
  req.checkBody('area', 'area cannot be empty').notEmpty();
  req.checkBody('zone', 'zone cannot be empty').notEmpty();
  req.checkBody('interest', 'interest cannot be empty').notEmpty();
  let errors = req.validationErrors();
  if(errors){
    User.findOne({_id:req.user._id}).
    populate('memberRef').
    exec((err,user)=>{
      if(err) return handleError();
      res.render('register', {
        title:'Registration form',
        user:user,
        errors:errors
      })
    })
  }
  else{
    let today = new Date();
    let year = today.getFullYear();
    Member.count({}).
    exec((err,count)=>{
      console.log(count);
      let member = new Member({
        _id:new mongoose.Types.ObjectId(),
        name:req.user.name,
        email:req.body.email,
        imgSrc:req.file ? req.file.url : '/images/avatar.png',
        parish:req.body.parish,
        zone:req.body.zone,
        area:req.body.area,
        interest:req.body.interest,
        userRef:req.user._id,
        regNo:`Eb1/${year}/${count + 1000}`
      });

      member.save((err,done)=>{
        if(err) handleErrors(err,'/potal/print')
        console.log(done);
        //console.log('Registration Successfull...');
        User.update({_id:req.user._id},{memberRef:member._id}, (err,ok)=>{
          console.log(ok);
          req.flash('success', 'Registration Successful');
          res.redirect('/portal/print');
        });
      })
    });
  }
});

// print
router.get('/print', restrictAccess, (req,res,next)=>{
  Member.find({userRef:req.user._id}).populate('userRef').
  exec((err,member)=>{
    if(err) handleErrors(err,'/print')
    /*if(member.length == 0){  // if a user tries to acces the update route without being registered
      req.flash('error', 'Sorry, you are not registered');
      res.redirect('/portal/register')
    }
    else{*/
      console.log(member);
      let html = '<h1>This is a header</h1><p>These are the members:<p>'
      request('https://webtopdf.expeditedaddons.com/?api_key=' + process.env.WEBTOPDF_API_KEY + '&content=body&html_width=1024&margin=10&title=My+PDF+Title', function (error, response, body) {
        console.log('Status:', response.statusCode);
        console.log('Headers:', JSON.stringify(response.headers));
        //console.log('Response:', body);
        /*res.render('print', { 
          title:'Print Registration Form',
          member:member
        });*/
        let timeStamp = Date.now().toString() + '.pdf'
        fs.writeFile(timeStamp,body,(err)=>{
          let stream = fs.createReadStream(timeStamp);
          stream.pipe(res);
        })
      });
      
    //}
  });   
});

// GET == UPDATE PROFILE
router.get('/update', restrictAccess, (req,res,next)=>{
  User.findOne({_id:req.user._id}).
  populate('memberRef').
  exec((err,user)=>{
    if(err) return handleError();
    console.log(user.memberRef);
    if(user.memberRef == null){  // if a user tries to acces the update route without being registered
      req.flash('error', 'You need to be registered before you can update your profile');
      res.redirect('/portal/register')
    }
    else{
      res.render(user.memberRef == null ? 'register': 'update', {
        title:user.memberRef == null ? 'Registration form': 'Update Profile',
        user:user,
      })
    }
    
  })
});

// Post == Update profile
router.post('/update', restrictAccess, (req,res,next)=>{
  req.checkBody('parish', 'parish cannot be empty').notEmpty();
  req.checkBody('zone', 'zone cannot be empty').notEmpty();
  req.checkBody('area', 'area field cannot be empty').notEmpty();
  req.checkBody('interest', 'interest field cannot be empty').notEmpty();

  let errors = req.validationErrors();
  User.findOne({_id:req.user._id}).
  populate('memberRef').
  exec((err,user)=>{
    if(errors){
      req.flash('error', errors);
      res.render('update',{
        title:'Update Profile',
        errors:errors,
        user:user
      })
    }
    else{
      Member.update({_id:user.memberRef._id},{
        parish:req.body.parish,
        area:req.body.area,
        zone:req.body.zone,
        interest:req.body.interest
      }, (err,done)=>{
        if(err) handleErrors(err,'/update')
        console.log(done);
        req.flash('success', 'profile updated successfuly...');
        res.redirect('/portal');
      });
    }
  })
  
});


// ==== GENERATE Pin ====
router.get('/auth/secure/gen/pin', (req,res,next)=>{
  let hashArr = [];
  let unhashArr = [];
  for(i=0;i<20;i++){
    var random = new Random(Random.engines.mt19937().autoSeed());
    var randomPin = random.integer(100000000000, 999999999999); // generate random pin
    unhashArr.push(randomPin) // push the unhashpin to array
    //console.log(pinArr);
  }
    let unhashpin = new Unhashpin({
      pin:unhashArr,
      date: new Date()
    }).save((err,done)=>{
      if(err) handleErrors(err,'/auth/secure/gen/pin');
      //console.log(JSON.stringify(unhashObj));
      //console.log(JSON.parse(JSON.stringify(unhashObj)));
      fs.writeFile('tokens.html', `<html><title></title><body>
        <h1>Access Tokens</h1>
        <li>${unhashArr}</li>
      </body></html>`, function(err){
        if(err) handleErrors(err,'/auth/secure/gen/pin')
        fs.readFile('tokens.html' , function (err,data){
          //res.contentType("application/pdf");
          res.download('tokens.html');
        });
      })
      //res.xls('data.xlsx', JSON.parse(JSON.stringify(unhashObj)));
      //res.json(`${unhashArr}`)
    })
})
router.get('/html', function(req,res,next){
  
  
})
router.post('/login', requireLogout,
  passport.authenticate('local', {failureRedirect:'/portal', failureFlash:'Incorrect username or password'}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    // res.redirect('/users/' + req.user.username);
    req.flash('success', 'Welcome back');
    res.redirect(`${req.query.returnTo}`); // return the user to where he was
});

// Logout 
router.get('/logout', function(req, res, next){
  req.flash('info', 'You are logged out');
	req.session.destroy(function(err){
    //console.log('user logged out... session deleted.')
	  res.redirect('/portal')
	});
});

// *******======= ADMIN PANEL=========**********//
router.get('/admin',restrictAccess, masterLogin, (req, res,next) => {
  if(req.query.length == {}){
    console.log('no query')
    Member.find({}).populate('UserRef').exec((err,members)=>{
      console.log(members);
      res.render('portal_admin', {title:'Admin Panel | RCCG Ebonyi 1 Youth Portal',members:members});
    })
  }
  else{console.log(req.query)
    let sortby = req.query.sortby;
    let sortval = req.query.sortval;
    Member.find({[sortby]:sortval}).populate('UserRef').exec((err,members)=>{
      console.log(members);
      res.render('portal_admin', {title:'Admin Panel | RCCG Ebonyi 1 Youth Portal',members:members});
    })
  
  
  }
  router.get('/admin/download', restrictAccess, masterLogin, (req,res,next)=>{
    res.send('respond with a resource');
  })
  
});
module.exports = router;
