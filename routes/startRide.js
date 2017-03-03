var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');

function processStartRide(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        debug(req.body);

        var lat = req.body.lat ? req.body.lat : req.query.lat; 
        var lon = req.body.lon ? req.body.lon : req.query.lon; 
        var time = req.body.time ? req.body.time : req.query.time;
        var money = req.body.money ? req.body.money : req.query.money;

        var loadId = req.params.loadid;

        var point = {
          "lat": lat ? lat : 12.01,
          "lon": lon ? lon : 12.02,
          "time": time ? time : Date.now()
        }

        var rideObject = {
          "loadId": loadId,
          "status": "started",
          "startTime": Date.now(),
          "endTime": null,
          "money": money ? money : 500
        };

        debug(rideObject);

        db.collection('currentRides').remove({"loadId": loadId}, function(err, r) {
          db.collection('currentRides').insertOne(rideObject);
        });

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
