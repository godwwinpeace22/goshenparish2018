const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Blogpost = require('../models/blogpost');
const Comment = require('../models/comment');
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
		let popularPosts = Blogpost.find({}).sort({viewsCount:-1}).limit(3);
		let recentPosts = Blogpost.find({}).sort({index:-1}).limit(3);
		popularPosts.exec((err,popular_posts)=>{
			recentPosts.exec((err,recent_posts)=>{
				if(err) throw err;
				console.log(blogposts);
				res.render('blog', {
					title:'Blog | RCCG Faith Tabernacle',
					blogposts:blogposts,
					comments:blogposts.comments,
					popular_posts:popular_posts,
					recentPosts:recent_posts,
					//moment:moment
				})
			})
		})
	})
});
router.get('/:link', (req,res,next)=>{
	Blogpost.findOne({link:req.params.link}).
	populate('comments').
	exec((err,blogpost)=>{
		let popularPosts = Blogpost.find({}).sort({viewsCount:-1}).limit(3);
		let recentPosts = Blogpost.find({}).sort({index:-1}).limit(3);
		//console.log(blogpost);
		// update view counter
		try{
			Blogpost.update({_id:blogpost._id},{viewsCount:blogpost.viewsCount + 1}, (err,done)=>{
				popularPosts.exec((err,popular_posts)=>{
					recentPosts.exec((err,recent_posts)=>{
						if(err) throw err;
						res.render('readpost', {
							title:blogpost.title,
							blogpost:blogpost,
							comments:blogpost.comments,
							popular_posts:popular_posts,
							recentPosts:recent_posts
						})
					})
				})
			})
		}
		catch(err){
			console.log('blogpost viewsCount not updated ' + err)
		}
	})
})
router.post('/:link', (req,res,next)=>{
	req.checkBody('name', 'Your name is required').notEmpty()
	req.checkBody('email', 'Please provide a valid email').notEmpty()
	req.checkBody('email', 'Please provide a valid email').isEmail()
	req.checkBody('commentTxt', 'Please write a comment').notEmpty()
	
	Blogpost.findOne({link:req.params.link}).
	populate('comments').
	exec((err,blogpost)=>{
		if(err) throw err;
		let comment = new Comment({
			name:req.body.name,
			email:req.body.email,
			commentTxt:req.body.commentTxt,
			website:req.body.website,
			date:moment().format('D MMM YYYY'),
			blogpostId:blogpost._id
		});
		// Validate Errors
		let errors = req.validationErrors()
		if(errors){
			res.render('readpost', {
				title:'Blog | RCCG Faith Tabernacle',
				errors:errors,
				blogpost:blogpost,
				comments:blogpost.comments
			})
		}
		else{
			comment.save(function(err,done){
				console.log(done)
				// Comment saved, now make sure to update the blogpost ref to comments
				let arr = blogpost.comments;
				arr.push(comment._id)
				try{
					Blogpost.update({_id:blogpost._id},{comments:arr}, (err,ok)=>{
						res.redirect('/blog/' + req.params.link)
					})
				}
				catch(err){
					throw 'blogpost not updated' + err;
				}
				
			})
		}
	})
	
})

module.exports = router