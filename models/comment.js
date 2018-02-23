const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = mongoose.model('Comment', new Schema({
    name:String,
    body:String,
    email:String,
    sermonId:String,
    date:String,
    index:Number
}))