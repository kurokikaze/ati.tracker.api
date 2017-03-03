var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');


function processSetPoint(req, res, next) {

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
          db.collection('loadid:' + loadId).insertOne(point, function(r, err) {
            var answer = {
                'percent': 1.2
            };

            res.send(answer);
          });
      }
  });
  
}

/* POST начало маршрута */
router.post('/:loadid', processSetPoint);

router.get('/:loadid',  processSetPoint);

module.exports = router;
