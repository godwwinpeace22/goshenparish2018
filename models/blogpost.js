const mongoose = require('mongoose');
const Schema = mongoose.Schema
let BlogSchema = new Schema({
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
})
//BlogSchema.index({ title: 'text'});
BlogSchema.index({'$**': 'text'});
module.exports = mongoose.model('Blogpost', BlogSchema)