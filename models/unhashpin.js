const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = mongoose.model('Unhashpin', new Schema({
    name:String,
    pin:Array,
    dateCreated:Date
}))