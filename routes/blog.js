const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blogpost = require('../models/blogpost');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const multer = require('multer');
const moment = require('moment');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

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

// Get blog home
router.get('/', (req,res,next)=>{
    Blogpost.find({}).
    exec((err,blogposts)=>{
        console.log(blogposts);
        res.render('blog', {
            title:'Blog | RCCG Faith Tabernacle',
            blogposts:blogposts,
            moment:moment
        });
    })
});
router.get('/:link', (req,res,next)=>{
    Blogpost.findOne({link:req.params.link}).
    exec((err,blogpost)=>{
        console.log(blogpost);
        res.render('readpost', {
            title:req.params.title,
            blogpost:blogpost
        })
    })
})

module.exports = router