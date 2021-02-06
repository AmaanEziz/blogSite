const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
 username:{
     type:String,
     required:true,
     unique: true,
     default:""
 },
 password:{
     type:String,
     required: true,
     default:""
 },
 isLoggedIn:{
     type: Boolean,
     default: false
 }
})


module.exports = mongoose.model('Users',usersSchema)