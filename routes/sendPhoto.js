var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');
var fs = require('fs');

function processSendPhoto(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {
        var loadId = req.params.loadid;

        var lat = req.body.lat;
        var lon = req.body.lon;
        var timestamp = req.body.time ? req.body.time : Date.now();

        var photoBuffer = Buffer.from(req.body.photo, 'base64');

        var filename = loadId + '_' + timestamp + '.png';

        fs.writeFile("./public/images/" + filename, photoBuffer);

        db.collection("currentRides").find({"loadId": loadId}).toArray(function(err, rides) {
            if (rides && rides.length > 0 && rides[0].status != "finished") {
                var ride = rides[0];

                ride.needsPhoto = false;

                var photoObject = {
                    "loadId": loadId,
                    "path" : "/images/" + filename,
                    "lat" : lat,
                    "lon": lon,
                    "time" : timestamp
                }

                db.collection("loadPhotos").insertOne(photoObject, function(r, err) {});

                db.collection("currentRides").updateOne({"loadId": loadId}, ride, function(r, err) {
                    res.send(ride);
                });
            } else {
                res.send({"err" : "Поездка по loadId " + loadId + " не найдена либо завершена"});
            }
        });

      }
  });

}

/* POST отправка фото */
router.post('/:loadid', processSendPhoto);

module.exports = router;
