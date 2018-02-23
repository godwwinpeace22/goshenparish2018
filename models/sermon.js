const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SermonSchema = new Schema({
    index:Number,
    link:String,
    title:String,
    date:String,
    presentedBy:String,
    txt:String,
    venue:String,
    category:String,
    imgSrc:String
});
let Sermon = mongoose.model('Sermon', SermonSchema);
module.exports = Sermon;