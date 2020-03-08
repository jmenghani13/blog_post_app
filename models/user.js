const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  dob:{
    type: Date,
    required:true
  },
  gender:{
    type: String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  username:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  profile_picture:{
      type: String,
      default: "empty_profile.png"  
  }
});


const User = module.exports = mongoose.model('User',UserSchema);
