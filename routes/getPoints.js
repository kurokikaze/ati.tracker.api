var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');


function processGetPoints(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {

        if (req.body && req.body != '') {
          console.error(req.body);
        }

        var loadId = req.params.loadid;

        db.collection('loadid:' + loadId).find().toArray(function(err, result) {
            db.collection("loadPhotos").find({"loadId": loadId}).toArray(function(err, photos) {
                var points = result;
                for (var photoId in photos) {
                    if (photos.hasOwnProperty(photoId)) {
                        var photo = photos[photoId];
                        points.push({
                            "lat": photo.lat,
                            "lon": photo.lon,
                            "time": photo.time,
                            "photo": photo.path
                        });
                    }
                }

                if (req.query.callback) {
                    res.send(req.query.callback + '(' + JSON.stringify(points) + ');');
                } else {
                    res.send(points);
                }
            });
        });
      }
  });
  
}

/* POST получить существующие точки */
router.post('/:loadid', processGetPoints);

router.get('/:loadid',  processGetPoints);

module.exports = router;
