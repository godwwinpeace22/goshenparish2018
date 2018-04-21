const mongoose = require('mongoose');
const Schema = mongoose.Schema;
module.exports = mongoose.model('Comment', new Schema({
    name:String,
    commentTxt:String,
    email:String,
    blogpostId:{type:Schema.Types.ObjectId, ref:'Blogpost'},
    website:String,
    date:String
}))