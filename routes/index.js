var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        db.collection('currentRides').find().toArray(function(err, result) {
          if (result && result.length > 0) {
              res.render('index.pug', { title: 'Express', rides: result });
          } else {
              res.render('index.pug', { title: 'Express', rides: []});
          }
        });
      }
  });
  // res.render('index.pug', { title: 'Express' });
});

module.exports = router;
