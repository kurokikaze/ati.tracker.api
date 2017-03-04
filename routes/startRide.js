var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');
var geographicLib = require('geographiclib');

var geod = geographicLib.Geodesic.WGS84;

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

        var startPoint = {
          "lat" : 55.75,
          "lon": 37.61
        };

        if (
          req.body.startPoint && 
          req.body.startPoint.lat && 
          req.body.startPoint.lon) {
          startPoint = {
            "lat" : req.body.startPoint.lat,
            "lon" : req.body.startPoint.lon
          }
        }

        var endPoint = {
          "lat": 59.938,
          "lon": 30.314
        };

        if (
          req.body.endPoint && 
          req.body.endPoint.lat && 
          req.body.endPoint.lon) {
          endPoint = {
            "lat" : req.body.endPoint.lat,
            "lon" : req.body.endPoint.lon
          }
        }

        var r = geod.Inverse(startPoint.lat, startPoint.lon, endPoint.lat, endPoint.lon);
        var distance = r.s12.toFixed(0); // Округляем до метра, GPS всё равно точнее не покажет

        var rideObject = {
          "loadId": loadId,
          "status": "started",
          "startTime": Date.now(),
          "endTime": null,
          "money": money ? money : 500,
          "startPoint": startPoint,
          "endPoint": endPoint,
          "distance": distance,
          "needsPhoto": false,
          "currentProgress": 0
        };

        debug(rideObject);

        db.collection('currentRides').remove({"loadId": loadId}, function(err, r) {
          db.collection("loadPhotos").remove({"loadId": loadId});
          db.collection('currentRides').insertOne(rideObject);
        });

        db.collection('loadid:' + loadId).remove(function(err, r){
          db.collection('loadid:' + loadId).insertOne(point);
          // Точка вставлена, теперь надо найти расстояние
          var r = geod.Inverse(startPoint.lat, startPoint.lon, lat, lon);
          var distance = r.s12.toFixed(0); // Округляем до метра, GPS всё равно точнее не покажет

          var answer = {};

          res.send('Начал перевозку для груза ' + loadId + ', lat: ' + lat + ', lon: ' + lon + ', time: ' + time + ', money: ' + money);
        });
      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processStartRide);

router.get('/:loadid',  processStartRide);

module.exports = router;
