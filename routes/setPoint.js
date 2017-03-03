var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');
var geographicLib = require('geographiclib');

var geod = geographicLib.Geodesic.WGS84;

function processSetPoint(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        var loadId = req.params.loadid;

        if (req.body.length) {
            var points = [];
            for (var i in req.body) {
                if (req.body.hasOwnProperty(i)) {
                    var sentPoint = req.body[i];
                    var point = {
                        "lat": sentPoint.lat ? sentPoint.lat : 314,
                        "lon": sentPoint.lon ? sentPoint.lon : 420,
                        "time":  sentPoint.time ? sentPoint.time : Date.now()
                    }

                    points.push(point);
                }
            }
            db.collection("currentRides").find({"loadId": loadId}).toArray(function(err, result) {
                if (result && result.length > 0 && result[0].status != "finished") {
                    db.collection('loadid:' + loadId).insertMany(points, function(r, err) {
                        var answer = {
                            'percent': 3.4
                        };

                        res.send(err ? err : answer);
                    });
                } else {
                    res.send({"err" : "Поездка по loadId " + loadId + " не найдена либо завершена"});
                }
            });
        } else {
            var lat = req.body.lat ? req.body.lat : req.query.lat; 
            var lon = req.body.lon ? req.body.lon : req.query.lon; 
            var time = req.body.time ? req.body.time : req.query.time; 

            debug("load: %s", loadId);
            debug("lat: %d", lat);
            debug("lon: %d", lon);
            debug("time: %d", time);

            var point = {
                "lat": lat ? lat : 12.01,
                "lon": lon ? lon : 12.02,
                "time": time ? time : Date.now()
            }

            var resultPercent = 0;

            db.collection("currentRides").find({"loadId": loadId}).toArray(function(err, rides) {
                if (rides && rides.length > 0 && rides[0].status != "finished") {
                    var ride = rides[0];
                    if (ride.endPoint && ride.distance) {
                        debug("endpoint found");
                        var r = geod.Inverse(ride.endPoint.lat, ride.endPoint.lon, lat, lon);
                        var distance = Math.floor(r.s12); // Округляем до метра, GPS всё равно точнее не покажет
                        debug("point distance: %f", distance);

                        var percentage = 100 - (distance / ride.distance) * 100;
                        
                        if (percentage > ride.currentProgress) {
                            resultPercent = percentage.toFixed(0);
                        }
                    }
                    
                    db.collection('loadid:' + loadId).insertOne(point, function(r, err) {
                        var answer = {
                            'percent': resultPercent
                        };

                        res.send(answer);
                    });
                } else {
                    res.send({"err" : "Поездка по loadId " + loadId + " не найдена либо завершена"});
                }
            });
        }
      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processSetPoint);

router.get('/:loadid',  processSetPoint);

module.exports = router;
