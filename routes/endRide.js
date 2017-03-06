var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');

function processEndRide(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        debug(req.body);

        var lat = req.body.lat ? req.body.lat : req.query.lat; 
        var lon = req.body.lon ? req.body.lon : req.query.lon; 
        var time = req.body.time ? req.body.time : req.query.time;

        var loadId = req.params.loadid;

        var point = {
          "lat": lat ? lat : 12.01,
          "lon": lon ? lon : 12.02,
          "time": time ? time : Date.now()
        }


        db.collection('loadid:' + loadId).insertOne(point, function(err, result) {
            db.collection("currentRides").find({"loadId": loadId}).toArray(function(err, result) {
                debug('Result:');
                debug(result);
                if (result && result.length > 0) {
                    var rideUpdate = result[0];
                    rideUpdate.status = "finished";
                    rideUpdate.endTime = Date.now();

                    debug(rideUpdate);

                    db.collection('currentRides').updateOne({"loadId": loadId}, rideUpdate, function(err, r) {
                        var answer = {
                            "percent" : 100
                        };

                        res.send(answer);
                        res.end();
                    });
                } else {
                    res.send({"error": "no ride for load " + loadId});
                    res.end();
                    return true;
                }
            });
        });
      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processEndRide);

router.get('/:loadid',  processEndRide);

module.exports = router;
