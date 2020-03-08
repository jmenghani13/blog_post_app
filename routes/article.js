const express = require('express');
const router =express.Router();
const { check, validationResult } = require('express-validator');
var mongoose = require('mongoose');


//Bring in Models
let Article = require('../models/article');
let User = require('../models/user');

//Add Route
router.get('/add' , ensureAuthenticated, (req,res) => {
  res.render('add_article',{
    title: 'Add Article'
  });
});

//Add Submit POST Route
router.post('/add',[
  check('title','Title is required').not().isEmpty(),
  check('body','Body is required').not().isEmpty()],  (req, res) => {

  const errors = validationResult(req);

if(!errors.isEmpty())
  {

    req.flash('danger','No field can be blank');
    res.redirect('/article/add');
  }
  else {
    User.findById(req.user._id,function(err, user){
      let article=new Article();
      article.title = req.body.title;
      article.author=req.user._id;
      article.body=req.body.body;
      article.author_name=user.name;
      article.date = new Date();

      article.save(function(err){
        if(err){
          console.log(err.message);
          return;
        } else {
          req.flash('success','Article Added');
          res.redirect('/');
        }
      });
    });
  }
});

//load Edit Form
router.get('/edit/:id',ensureAuthenticated,function(req,res){
  Article.findById(req.params.id, function(err, article){
  if(article.author != req.user._id){
    req.flash('danger','Not Authorized');
    res.redirect('/');
  }    res.render('edit_article',{
      title: "Edit Article",
      article: article
    });
  });
});

//Update Submit POST Route
router.post('/edit/:id',[
  check('title','Title is required').not().isEmpty(),
  check('body','Body is required').not().isEmpty()],function(req,res){

  const errors = validationResult(req);

  if(!errors.isEmpty())
  {

      req.flash('danger','No field can be blank');
      Article.findById(req.params.id, function(err, article){
      res.redirect('/article/edit/'+req.params.id)
      });
  }
  else
  {
      let article ={};

      article.title = req.body.title;
      article.body=req.body.body;

      let query = {  _id:req.params.id }

      Article.updateOne(query,article,function(err){
      if(err)
      {
        console.log(err.message);
        return;
      }
      else
      {
        req.flash('success','Article Updated');
        res.redirect('/');
      }
      });
    }
});

//Posting Commment
router.post('/:id',[check('comment').not().isEmpty()], function(req,res){
  const errors = validationResult(req);

  if(!errors.isEmpty())
  {
    req.flash('danger','Invalid comment');

    res.redirect('/article/'+req.params.id);
    res.render('article',{

    });
    return;
  }

  Article.findById(req.params.id, function(err, article){
      var comment_object= { user_id: req.user._id , comment_text : req.body.comment, date:new Date()};
      console.log(comment_object.date);
      article.comments.push(comment_object);

      let query = {  _id:req.params.id };
      Article.updateOne(query,article,function(err){
      if(err)
      {
        message: err.message;
        return;
      } else {
        res.redirect('/');
      }
      });
  });
});



//Liking Article
  router.post('/likes/:id',function(req,res){

    Article.findById(req.params.id, function(err, article){

      if(article.likes.indexOf(req.user._id) !== -1)
      {
        article.likes.splice(article.likes.indexOf(req.user._id),1);
      }
      else
      {
        article.likes.push(req.user._id);
      }
        let query = { _id : req.params.id};
        Article.updateOne(query,article,function(err){
          if(err)
          {
            console.log(err.message);
            return;
          }
          else
          {
            res.status(200).json({
              message: "success"
            });
          }
        });
    });
  });

//Diplaying users who  liked the post
router.get('/likes/:id',ensureAuthenticated,function(req,res){

      Article.findOne({_id:req.params.id}).populate('likes','name').exec(function(err, article){
        if(err)
        {
          console.log(err.message);
        }
        else
        {
        res.render('like',{
        article: article,
        });
        }
      });
});

//Get Single Article
router.get('/:id',ensureAuthenticated,function(req,res){
  Article.findOne({_id:req.params.id}).populate('comments.user_id','name').exec(function(err, article){
    res.render('article',{
      article: article,
    });
  });
});

//Deleting Article
router.delete('/:id',function(req,res){
  if(!req.user._id){
    res.status(500).send();
  }

  let query = { _id: req.params.id};
  Article.findById( req.params.id, function(err,article){
    if(article.author != req.user._id)
    {
      res.status(500).send();
    }
    else
    {
      Article.deleteOne(query, function(err){
        if(err)
        {
          console.log(err.message);
        }
        res.send('Success');
      });
    }
  });
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger','Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
