var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');

function processRequestPhoto(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        var loadId = req.params.loadid;

        db.collection("currentRides").find({"loadId": loadId}).toArray(function(err, rides) {
            if (rides && rides.length > 0 && rides[0].status != "finished") {
                var ride = rides[0];

                ride.needsPhoto = true;
                                
                db.collection("currentRides").updateOne({"loadId": loadId}, ride, function(r, err) {
                    if (req.query.callback) {
                        res.send(req.query.callback + '(' + JSON.stringify(ride) + ');');
                    } else {
                        res.send(ride);
                    }
                });
            } else {
                var error = {"err" : "Поездка по loadId " + loadId + " не найдена либо завершена"};
                if (req.query.callback) {
                    res.send(req.query.callback + '(' + JSON.stringify(error) + ');');
                } else {
                    res.send(error);
                }
                res.send();
            }
        });

      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processRequestPhoto);

router.get('/:loadid',  processRequestPhoto);

module.exports = router;
