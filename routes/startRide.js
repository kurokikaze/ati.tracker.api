var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');


function processStartRide(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {

        if (req.body && req.body != '') {
          console.error(req.body);
          //var request = JSON.parse(req.body);
        }

        var lat = req.params.lat ? req.params.lat : req.query.lat; 
        var lon = req.params.lon ? req.params.lon : req.query.lon; 
        var time = req.params.time ? req.params.time : req.query.time; 

        var loadId = req.params.loadid;
        var point = {
          "lat": lat ? lat : 12.01,
          "lon": lon ? lon : 12.02,
          "time": time ? time : Date.now()
        }
        db.collection('loadid:' + loadId).remove(function(err, r){
          db.collection('loadid:' + loadId).insertOne(point);
          var answer = {};

          res.send('Начал перевозку для груза ' + loadId + ', lat: ' + lat + ', lon: ' + lon + ', time: ' + time);
        })
      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processStartRide);

router.get('/:loadid',  processStartRide);

module.exports = router;
