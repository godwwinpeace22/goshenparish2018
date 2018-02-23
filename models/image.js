const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = mongoose.model('Image', new Schema({
    index:String,
    imgSrc:String,
    imgSrcSecure:String,
    type:String,
    desc:String,
    fullData:Object,
    dateUploaded:String
}));