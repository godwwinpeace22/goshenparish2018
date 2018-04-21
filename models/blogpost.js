const mongoose = require('mongoose');
const Schema = mongoose.Schema
module.exports = mongoose.model('Blogpost', new Schema({
    title:String,
    link:String,
    author:String,
    date:String,
    index:String,
    comments:[{type:Schema.Types.ObjectId, ref:'Comment'}],
    imgSrc:String,
    authorImg:String,
    txt:String,
    viewsCount:Number,
}))