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
 },
 following:{
     type:[String],
     default:[],
    unique:false,
 },
 followers:{
    type:[String],
    default:[],
   unique:false,
},
photoURL:{
    type:String,
    unique:false,
    default:"https://pbs.twimg.com/profile_images/740272510420258817/sd2e6kJy_400x400.jpg"

},
Bio:{
    type:String,
    default:"",
    unique:false
}
})


module.exports = mongoose.model('Users',usersSchema)