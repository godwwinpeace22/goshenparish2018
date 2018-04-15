const express = require('express');
const router = express.Router();
const Sermon = require('../models/sermon');
const Event = require('../models/event');
const Image = require('../models/image');
const Comment = require('../models/comment');
const config = require('../config.js').get(process.env.NODE_ENV);
const { check,validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
//app.use(expressValidator(middlewareOptions));
//require('dotenv').config();
//var config = require('config');
//const s3 = require('s3');
const cloudinary = require('cloudinary');
const nodemailer = require('nodemailer');
const moment = require('moment');
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
let storageTwo = multer.diskStorage({
  destination: function (req, file, cb) {
	cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
	let arr = file.mimetype.split('/');
	let extension = arr[arr.length - 1];
	cb(null, file.fieldname + Date.now() )
  }
})

var upload = multer({ storage: storage })
var uploadTwo = multer({storage:storageTwo});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home | RCCG Goshen Parish' });
});

// GET Sermons
router.get('/sermons/page/:pageNumber', (req,res,next)=>{
  Sermon.find({venue:'Not An Event'}).limit(4).sort({index:-1}).skip((req.params.pageNumber*1 - 1) * 4).exec((err,sermons)=>{
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
	Sermon.count({venue:'Not An Event',category:req.params.category}, function(err, count){
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
		console.log(done);
		res.redirect('/sermons/' + req.params.link);
	});
});



// GET Events
router.get('/events', (req,res,next)=>{
	console.log(req.query);
	if(req.query.all == 'true'){
		console.log(req.query.all);
		console.log(req.query.day);
		console.log(req.query.month);
		console.log(req.query.year);
		Event.find({$and:[ {'day': req.query.day}, {'month': req.query.month}, {'year':req.query.year}]}).exec((err,events)=>{
			if(err) throw err;
			console.log(events);
			res.render('events', {
				title:'Upcoming Events',
				events:events
			});
		})
	}
	else{
		let key = Object.keys(req.query)[1];
		console.log(key)
		console.log(req.query[key]);
		Event.find({[key]: req.query[key]}).exec((err,events)=>{
			if(err) throw err;
			console.log(events);
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
		console.log(images);
		res.render('gallery', {
			title:'Gallery | Goshen Parish',
			images:images,
			url:req.protocol + '://' + req.get('host')
		});
	});
})
//GET calendar
router.get('/calendar', (req,res,next)=>{
  res.render('calendar', {title:'Calendar 2018 | Goshen Parash'})
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
	user: config.gmail.email,
	pass: config.gmail.password
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
		to: config.gmail.email,
		subject: 'I Am New Here',
		text: `Hi, I am ${req.body.name}. 
			'req.body.mailBody`
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' +  info.response +', ' + info.messageId);
			res.render('success', {title:'Email recieved', msg:'Thank you for contacting us!. Your email has been recieved'});
		}
	});
});

/* Admin Block*/

//Create a client
/*var client = s3.createClient({
  maxAsyncS3: 20,     // this is the default 
  s3RetryCount: 3,    // this is the default 
  s3RetryDelay: 1000, // this is the default 
  multipartUploadThreshold: 20971520, // this is the default (20 MB) 
  multipartUploadSize: 15728640, // this is the default (15 MB) 
  s3Options: {
	accessKeyId: config.s3.accessKeyId,
	secretAccessKey: config.s3.secretAccessKey
  },
});*/
router.get('/admin/newsermon', (req,res,next)=>{
  res.render('newsermon', {title:'New Sermon | Admin'});
});

router.get('/admin/newmedia', (req,res,next)=>{
  res.render('newmedia', {title:'New Media | Admin'});
});
router.get('/admin/newevent', (req,res,next)=>{
	res.render('newevent', {title:'New Event | Admin'});
});
// Create Events
router.post('/admin/newevent',(req,res,next)=>{
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
		console.log(errors);
    res.render('newevent', {
			title:'Upcoming Events',
			errors: errors,
			event:event
		});
  }

	else{
		event.save((err,done)=>{
			if(err) throw err;
			console.log('Saving Event... ' + done);
			 res.redirect('/events');
		})
	}
});


router.post('/admin/newsermon', upload.single('imgSrc'), (req,res,next)=>{

  //upload a file
		cloudinary.config({
			cloud_name: process.env.cloud_name || config.cloudinary.cloud_name,
			api_key:process.env.api_key || config.cloudinary.api_key,
			api_secret:process.env.api_secret || config.cloudinary.api_secret
		});
		cloudinary.uploader.upload(req.file.path, function(result) {
			var sermon = new Sermon({
				title:req.body.title,
				link:(req.body.title).split(' ').join('-'),
				index: Date.now(),
				imgSrc: result.url,
				fullData:result,
				presentedBy:req.body.presentedBy,
				date:moment(req.body.date).format("D MMM YYYY"),
				venue:req.body.venue == '' ? 'Not An Event' : req.body.venue,
				category:req.body.category,
				txt:req.body.txt
			});

			sermon.save(function(err, done){
				if(err) throw err;
				console.log('saving sermon..... sermon saved');
				res.redirect('/admin/newsermon');
			});
		},{public_id: req.file.filename});
	/*var params = {
	  localFile: req.file.path,
	 
	  s3Params: {
		Bucket: configure.s3.bucketName,
		Key: req.file.filename
	  }
	};
	var uploader = client.uploadFile(params);
	uploader.on('error', function(err) {
	  console.error("unable to upload:", err.stack);
	});
	uploader.on('progress', function() {
	  console.log("progress", uploader.progressMd5Amount,
	  uploader.progressAmount, uploader.progressTotal);
	});
	uploader.on('end', function() {
	  console.log("done uploading");*/
	  
	/*});*/
  
});




//add media
router.post('/admin/newmedia', uploadTwo.single('imgSrc'), (req,res,next)=>{

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
	console.error("unable to upload:", err.stack);
  });
  uploader.on('progress', function() {
	console.log("progress", uploader.progressMd5Amount,
	uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on('end', function() {
	console.log("done uploading"); */

	cloudinary.config({
		cloud_name: process.env.cloud_name || config.cloudinary.cloud_name,
		api_key:process.env.api_key || config.cloudinary.api_key,
		api_secret:process.env.api_secret || config.cloudinary.api_secret
	})
	cloudinary.uploader.upload(req.file.path, function(result) {
		//console.log(result);
		let image = new Image({
			index:Date.parse(new Date()),
			type:'Img',
			imgSrc:result.url,
			imgSrcSecure:result.secure_url,
			desc:req.body.desc, //description of the image
			fullData:result, // stores full data of the uploaded image
			dateUploaded:new Date()
		});
		image.save(function(err,done){
			if(err) throw err;
			console.log('saving image to mongoose... saved' + done);
			res.redirect('/admin/newmedia')
		})
	},{public_id: req.file.filename});

	
  //});
  
});
module.exports = router;

// nodemon --exec "heroku local" --signal SIGTERM