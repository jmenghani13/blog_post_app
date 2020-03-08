const express = require('express');
const path = require('path');
var fs = require('fs');
var os = require('os');
const router =express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Busboy = require('busboy');

//Bring in User Model
let User = require('../models/user');
let Article = require('../models/article');

//Register Form
router.get('/register', function(req,res){
  res.render('register');
})


router.post('/register',[
  check('name').not().isEmpty(),
  check('dob').not().isEmpty(),
  check('gender').not().isEmpty(),
  check('email').not().isEmpty(),
  check('email').isEmail(),
  check('username').not().isEmpty(),
  check('password').not().isEmpty(),
  check('password2').not().isEmpty()],function(req,res){

    const name = req.body.name;
    const dob = req.body.dob;
    const gender = req.body.gender;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

  var temp;
  var query = {email: email}
  User.findOne(query,function(err,user){
    if(err)
    {
      message: err.message;
      return;
    }
    if(user)
    {
      temp=user.email;
    }
  });


  if(temp !== null)
  {
    req.flash('danger',"Email already exists.");
    res.redirect('/users/register');
    return;
  }


  query = {username: username }
  User.find(query,function(err,user){
    if(err)
    {
      message: err.message;
      return;
    }

    if(user)
    {
      temp= user.username;
    }
  });

  if(temp !== "test")
  {
    req.flash('danger',"Username already exists.");
    res.render('register',{
    });
    return;
  }

  if(req.body.password !== req.body.password2)
  {
    req.flash('danger',"Passwords don't match.");
    res.render('register',{
    });
    return;
  }

  const errors = validationResult(req);

  if(!errors.isEmpty())
  {

      req.flash('danger','Oops!! Something went wrong.');
      req.flash('danger','Please enter valid details.');
      res.render('register',{
        //errors: errors
      });
  } else {
      let newUser = new User({
        name: name,
        dob: dob,
        gender: gender,
        email: email,
        username: username,
        password: password

    });

    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err.message);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err.message);
              return;
            } else {

                req.flash('success','You are now registered.');
                res.redirect('/users/login');
            }
          });
        });
    });
  }
});

//Login Form
router.get('/login',function(req,res){
    res.render('login');
});

//User Profile
router.get('/profile/:id',ensureAuthenticated,function(req,res){
    User.findById(req.params.id,function(err,user) {
      Article.find({}).populate('comments.user_id','name').exec(function(err, articles){
        res.render('profile',{
        user: user,
        articles: articles,
        });
      });
    });
});

//Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res,next);
});

//logout
router.get('/logout',function(req, res){
  req.logout();
  req.flash('success','You are logged out');
  res.redirect('/users/login');
});

// accept POST request on the homepage
router.post('/profile/:id', function (req, res) {
  User.findById(req.params.id,function(err,user) {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      var saveTo = path.join('public/photos', user.username);
      console.log('Uploading: ' + saveTo);
      file.pipe(fs.createWriteStream(saveTo));
    });
    busboy.on('finish', function() {
      console.log('Upload complete');

      user.profile_picture=user.username;
      let query = {  _id:req.params.id };
      User.updateOne(query,user,function(err){
      if(err)
      {
        message: err.message;
        return;
      }
      });

      req.flash('success','Picture Uploaded');
      res.redirect('/users/profile/'+req.params.id)
    });
    return req.pipe(busboy);
    });
});


//Authentication for login
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
