var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');
var debug = require('debug')('ati-tracker-api');

function processCheckStatus(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {

        if (req.body && req.body != '') {
          console.error(req.body);
        }

        var loadId = req.params.loadid;
        var result = {
            "needsPhoto" : false
        };

        db.collection("currentRides").find({"loadId" : loadId}).toArray(function(err, rides) {
          if (rides && rides.length > 0) {
            var ride = rides[0];

            debug(ride);

            if (ride.needsPhoto) {
                result.needsPhoto = true;
            }

            if (req.query.callback) {

                res.send(req.query.callback + '(' + JSON.stringify(result) + ');');

            } else {

                res.send(result);

            }
          } else {
              res.send({"error": "Груз " + loadId + " не существует"});
          }
        });
      }
  });
  
}

/* POST получить существующие точки */
router.post('/:loadid', processCheckStatus);

router.get('/:loadid',  processCheckStatus);

module.exports = router;
