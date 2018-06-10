const express = require('express');
const router = express.Router();
require('dotenv').config()
const Sermon = require('../models/sermon');
const Event = require('../models/event');
const Image = require('../models/image');
const Blogpost = require('../models/blogpost');
const Comment = require('../models/comment');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const { check,validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
const moment = require('moment');
const multer = require('multer');
cloudinary.config({
	cloud_name: process.env.cloud_name,
	api_key: process.env.api_key,
	api_secret: process.env.api_secret
});

var storage = cloudinaryStorage({
	cloudinary: cloudinary,
	folder: 'faithtabernacle',
	allowedFormats: ['jpg', 'png'],
	filename: function (req, file, cb) {
		cb(undefined, 'imgSrc' + Date.now());
	}
});
var storage2 = cloudinaryStorage({
	cloudinary: cloudinary,
	folder: 'faithtabernacle',
	allowedFormats: ['jpg', 'png'],
	filename: function (req, file, cb) {
		cb(undefined, file.fieldname + Date.now());
	}
});

let upload = multer({ storage: storage });
let upload2 = multer({ storage: storage2 });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home | RCCG Faith Tabernacle' });
});

// GET Sermons
router.get('/sermons/page/:pageNumber', (req,res,next)=>{
  Sermon.find({}).limit(4).sort({index:-1}).skip((req.params.pageNumber*1 - 1) * 4).exec((err,sermons)=>{
	if(err) throw err;
	Sermon.count({venue:'Not An Event'}, function(err, count){
		Image.find({}).limit(3).sort({index:-1}).exec((err,images)=>{
			res.render('sermons', {
				title:'sermons',
				sermons:sermons,
				images:images,
				count:count,
				url:req.protocol + '://' + req.get('host')
			});
		});
	})
	
  });
  
});
//GET Sermons details
router.get('/sermons/:link', (req,res,next)=>{
  Sermon.findOne({link:req.params.link}, (err,sermon)=>{
	if(err) throw err;
	Comment.find({sermonId:sermon._id}, (err,comments)=>{
		if(err) throw err;
		Image.find({}).limit(3).sort({index:-1}).exec((err,images)=>{
			res.render('sermondetails', {
				title:sermon.title,
				sermon:sermon,
				comments:comments,
				images:images,
				url:req.protocol + '://' + req.get('host')
			});
		});
		
	});
  });
});

//GET Sermon Categories
router.get('/sermons/categories/:category/:pageNumber', (req, res,next)=>{
  Sermon.find({category:req.params.category}).sort({index:-1}).limit(4).skip((req.params.pageNumber*1 - 1) * 4).exec((err,sermons)=>{
	if(err) throw err;
	Sermon.count({category:req.params.category}, function(err, count){
		Image.find({}).limit(3).sort({index:-1}).exec((err,images)=>{
			res.render('sermons', {
				title: "Sermons",
				sermons:sermons,
				images:images,
				count:count,
				msg:'No sermons for this category yet.',
				url:req.protocol + '://' + req.get('host')
			});
		});
		
	});
	
  });
});
// POST comments
router.post('/sermons/:link', (req,res,next)=>{
	let comment =  new Comment({
		name:req.body.name,
		body:req.body.body,
		email:req.body.email,
		sermonId:req.body.sermonId,
		date: moment().format('D MMM YYYY'),
		index:Date.now()
	});
	comment.save(function(err,done){
		if(err) throw err;
		//console.log(done);
		res.redirect('/sermons/' + req.params.link);
	});
});



// GET Events
router.get('/events', (req,res,next)=>{
	//console.log(req.query);
	if(req.query.all == 'true'){
		//console.log(req.query.all);
		//console.log(req.query.day);
		//console.log(req.query.month);
		//console.log(req.query.year);
		Event.find({$and:[ {'day': req.query.day}, {'month': req.query.month}, {'year':req.query.year}]}).exec((err,events)=>{
			if(err) throw err;
			//console.log(events);
			res.render('events', {
				title:'Upcoming Events',
				events:events
			});
		})
	}
	else{
		let key = Object.keys(req.query)[1];
		//console.log(key)
		//console.log(req.query[key]);
		Event.find({[key]: req.query[key]}).exec((err,events)=>{
			if(err) throw err;
			//console.log(events);
			res.render('events', {
				title:'Upcoming Events',
				events:events
			});
		})
	}
});

//GET gallery
router.get('/gallery', (req,res,next)=>{
	Image.find({}).sort({index:-1}).exec((err,images)=>{
		//console.log(images);
		res.render('gallery', {
			title:'Gallery | Faith Tabernacle Parish',
			images:images,
			url:req.protocol + '://' + req.get('host')
		});
	});
})
//GET calendar
router.get('/calendar', (req,res,next)=>{
  res.render('calendar', {title:'Calendar 2018 | Faith Tabernacle Parash'})
});

// ===== ABOUT US ===== //
router.get('/about', (req,res,next)=>{
	res.render('about', {
		title:'About Us'
	});
});

// ==== Our Ministries ==== //
router.get('/ministries', (req,res,next)=>{
	res.render('ministries', {title:'Our Minsitries'});
})

/* Send Mails*/
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
	user: process.env.email,
	pass: process.env.password
  }
});


//GET contact
router.get('/contact', (req,res,next)=>{
  res.render('contact', {title:'Contact Us'});
});
//POST contact
router.post('/contact', (req,res,next)=>{
  	// setup email data
	var mailOptions = {
		from: req.body.email,
		to: process.env.email,
		subject: 'I Am New Here',
		text: `Hi, I am ${req.body.name}. 
			'req.body.mailBody`
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			//console.log(error);
		} else {
			//console.log('Email sent: ' +  info.response +', ' + info.messageId);
			res.render('success', {title:'Email recieved', msg:'Thank you for contacting us!. Your email has been recieved'});
		}
	});
});

/* Admin Block*/
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

//allow access to Master only.
let masterLogin = function(req,res,next){
  bcrypt.compare(process.env.masterPassword,req.user.password,  function(err, response) {
    if(err) throw err;
    
    // res === true || res === false
    if(req.user.username === process.env.masterUsername && response === true){
      next();
    } 
    else{
      res.render('login', {returnTo:req.originalUrl});
    }
  }); 
}
router.get('/master', restrictAccess, masterLogin, (req,res,next)=>{
	res.render('dashboard', {title:'Admin'})
})
router.get('/master/newsermon', restrictAccess, masterLogin, (req,res,next)=>{
  res.render('newsermon', {title:'New Sermon | Admin'});
});

router.get('/master/newmedia', restrictAccess, masterLogin, (req,res,next)=>{
  res.render('newmedia', {title:'New Media | Admin'});
});
router.get('/master/newevent', (req,res,next)=>{
	res.render('newevent', {title:'New Event | Admin'});
});
// Create Events
router.post('/master/newevent', restrictAccess, masterLogin,(req,res,next)=>{
	let event = new Event({
		title:req.body.title,
		location:req.body.location,
		details:req.body.details,
		date:moment(req.body.date).format("D MMM YYYY"),
		time:req.body.time,
		year:req.body.year,
		month:req.body.month,
		week:req.body.week,
		day:req.body.day,
		others:req.body.others
	});
	req.checkBody('title', 'title cannot be empty').notEmpty()
	req.checkBody('location', 'location cannot be empty').notEmpty()
	req.checkBody('details', 'details cannot be empty').notEmpty()
	req.checkBody('date', 'date cannot be empty').notEmpty()
	req.checkBody('time', 'please enter a valid time').notEmpty()
	req.checkBody('year', 'year cannot be empty').notEmpty()
	req.checkBody('month', 'month cannot be empty').notEmpty()
	req.checkBody('day', 'day cannot be empty').notEmpty()
	
	let errors = req.validationErrors();

	if (errors) {
		//console.log(errors);
    res.render('newevent', {
			title:'Upcoming Events',
			errors: errors,
			event:event
		});
  }

	else{
		event.save((err,done)=>{
			if(err) throw err;
			//console.log('Saving Event... ' + done);
			req.flash('success', 'Event created successfully!');
			res.redirect('/events');
		})
	}
});

router.get('/master/newblogpost',restrictAccess, masterLogin, (req,res,next)=>{
	res.render('newblogpost', {title:'Create Blog Post | Admin'})
})
// Create blog post
router.post('/master/newblogpost',restrictAccess,masterLogin, upload2.array('imgSrc', 2), (req,res,next)=>{
	let blogpost = new Blogpost({
		title:req.body.title,
		link:(req.body.title).split(' ').join('-'),
		author:req.body.author,
		date:moment(req.body.date).format("D MMM YYYY"),
		index:Date.now(),
		comments:[],
		imgSrc:req.files ? req.files[0].url : '/images/blogcover.jpg',
		authorImg:req.files ? req.files[1].url : '/images/authorcover.jpg',
		txt:req.body.txt,
		viewsCount:0
});
	// Run Validations
	req.checkBody('title', 'Title should be empty').notEmpty()
	req.checkBody('author', 'Author should be provided').notEmpty()
	req.checkBody('date', 'This post must have a valid date').notEmpty()
	req.checkBody('txt', 'This post must have a blog text').notEmpty()
	let errors = req.validationErrors();
	if(errors){
		res.render('newblogpost', {
			title:'Create Blog Post | Admin',
			errors:errors,
			blogpost:blogpost
		});
	}
	else{
		blogpost.save(function(err,done){
			//console.log(done);
			res.redirect('/blog');
		});
	}
	


})
router.post('/master/newsermon',restrictAccess, masterLogin, upload.single('imgSrc'), (req,res,next)=>{
	let sermon = new Sermon({
		title:req.body.title,
		link:(req.body.title).split(' ').join('-'),
		index: Date.now(),
		imgSrc: req.file.url,
		fullData:req.file,
		presentedBy:req.body.presentedBy,
		date:moment(req.body.date).format("D MMM YYYY"),
		category:req.body.category,
		txt:req.body.txt
	});
	req.checkBody('title', 'Title field cannot be empty').notEmpty();
	req.checkBody('presentedBy', 'Presented By field cannot be empty').notEmpty();
	req.checkBody('date', 'Date field cannot be empty').notEmpty();
	req.checkBody('txt', 'Message Text field cannot be empty').notEmpty();
	req.checkBody('category', 'Category field cannot be empty').notEmpty();

	let errors = req.validationErrors();
	if(errors){
		res.render('newsermon',{
			title:'Add New Sermon',
			errors:errors,
			sermon:sermon
		})
	}
	else{
		sermon.save(function(err, done){
			if(err) throw err;
			//console.log('saving sermon..... sermon saved');
			req.flash('success', 'Sermon added successfuly!');
			res.redirect('/master/newsermon');
		});
	}
});




//add media
router.post('/master/newmedia',restrictAccess, masterLogin, upload.array('imgSrc', 3), async (req,res,next)=>{

  //upload a file
  /*var params = {
	localFile: req.file.path, //disabled upload to s3 until setup is complete
   
	s3Params: {
	  Bucket: config.s3.bucketName,
	  Key: req.file.filename
	}
  }; */
  /*var uploader = client.uploadFile(params);
  uploader.on('error', function(err) {
	//console.error("unable to upload:", err.stack);
  });
  uploader.on('progress', function() {
	//console.log("progress", uploader.progressMd5Amount,
	uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
	//console.log("done uploading"); */
	try {
		req.checkBody('desc', 'Description field cannot be empty').notEmpty();
		let errors = req.validationErrors();
		if(errors){
			//console.log(new Error('There was an error'))
			res.render('newmedia', {
				title:'Add New Media',
				errors:errors
			})
		}
		else{
			let files = req.files;
			var index = 0
			for(i=0; i<files.length; i++){
				let image = new Image({
					index:Date.parse(new Date()),
					type:'Img',
					imgSrc:files[i].url,
					desc:req.body.desc, //description of the image
					fullData:files[i], // stores full data of the uploaded image
					dateUploaded:new Date()
				});
				image.save(err =>{
					console.log(image);
					index++
				});
			}
			if(index >= files.length -1){ // run this code only after all the images have been uploaded
				req.flash('success', 'Image uploaded successfully!');
				res.redirect('/master/newmedia');
			}
		}
	} catch (error) {
		console.log(error)
	}
	
  
});
module.exports = router;

// nodemon --exec "heroku local" --signal SIGTERM