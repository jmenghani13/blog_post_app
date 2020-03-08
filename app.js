const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser= require('body-parser');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require ('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open',function(){
  console.log("Connected to MongoDb");
});

db.on('error',function(){
  console.log(err.message);
});

//Inti App
const app = express();

//Bring in Models
let Article = require('./models/article');
let User = require('./models/user');


//Load View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false}));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Passport Config
require('./config/passport')(passport);
//
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

//Home Route
app.get('/', (req,res) => {

  Article.find({}).populate('comments.user_id','name').exec(function(err, articles){
    if(err)
    {
      console.log(err.message);
    } else
    {
      res.render('index',{
        articles: articles,
      });
    }
  });
});


//Route Files
let article = require('./routes/article');
let users = require ('./routes/users');
app.use('/users',users);
app.use('/article',article);

//Start server
app.listen(3000,function(){
  console.log('Server started on port 3000');
});
