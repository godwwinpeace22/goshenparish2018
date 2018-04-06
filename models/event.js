const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = mongoose.model('Event', new Schema({
    title:String,
    location:String,
    details:String,
    date:String,
    time:String,
    year:String,
    month:String,
    week:String,
    day:String,
    others:String
}));