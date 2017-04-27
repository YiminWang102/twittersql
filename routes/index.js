'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db');


module.exports = router;



// a reusable function
function respondWithAllTweets (req, res, next){
  client.query('SELECT * FROM tweets INNER JOIN users ON tweets.user_id = users.id', function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    res.render('index',
      { title: 'Twitter.js',
      tweets: tweets,
      showForm: true });
  });
}

function addTweetWithExistingUser(req, res, next){
  var name = req.body.name;
  var content = req.body.content;
  client.query('SELECT id FROM users WHERE name = $1',
  [name], function(err,result){

    if(err) return next(err);
    console.log(result);
    var userID = result.rows[0].id;

    client.query('INSERT INTO tweets (user_id, content) VALUES ($1, $2)',
      [userID, content], function (err, result){

        if(err) return next(err);

        res.redirect('/');
      });
  });
}

// here we basically treet the root view and tweets view as identical
// router.get('/', function(req, res, next) {client.query('SELECT * FROM tweets', function (err, result) {
//   if (err) return next(err); // pass errors to Express
//   var tweets = result.rows;
//   res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
// });});

router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

router.get('/users/:username', function(req, res, next){
  client.query('SELECT * FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE users.name = $1',
  [req.params.username], function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    res.render('index',
      { title: 'Twitter.js',
      tweets: tweets,
      showForm: true });
  });
});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  client.query('SELECT * FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE tweets.id = $1',
  [req.params.id], function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    console.log(result);
    res.render('index',
      { title: 'Twitter.js',
      tweets: tweets,
      showForm: true });
  });
});

// create a new tweet
router.post('/tweets', function(req, res, next){

  var name = req.body.name;
  var content = req.body.content;

  client.query('SELECT * FROM users WHERE name = $1',
  [name], function(err, result){
    if(result.rows.length === 1){
      addTweetWithExistingUser(req,res,next);
    }

    else{
      client.query('INSERT INTO users (name) VALUES ($1)',
      [name], function (err, result) {
        console.log(name);
        if (err) return next(err);
        addTweetWithExistingUser(req,res,next);
      });
    }

  });
});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
