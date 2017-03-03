var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');

/* POST начало маршрута */
router.post('/:loadid', function(req, res, next) {
  var answer = {};

  res.send('Начал перевозку для груза ' + req.params.loadid);
});

router.get('/:loadid', function(req, res, next) {
  var answer = {};

  res.send('Начал перевозку для груза ' + req.params.loadid);
});

module.exports = router;
