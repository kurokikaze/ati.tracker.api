var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var config = require('../bin/config.js');


function processGetRide(req, res, next) {

  MongoClient.connect(config.mongo, function(err, db) {
      if (err) {
        throw err
      } else {

        if (req.body && req.body != '') {
          console.error(req.body);
        }

        var loadId = req.params.loadid;

        db.collection('currentRides').find({"loadId" : loadId}).toArray(function(err, result) {
            if (result && result.length > 0) {
                var ride = result[0]
                if (req.query.callback) {
                    res.send(req.query.callback + '(' + JSON.stringify(ride) + ');');
                } else {
                    res.send(ride);
                }
            } else {
                res.send({'error': 'Поездка с id груза ' + loadId + ' не найдена'});
            }
        });
      }
  });
  
}

/* POST получить существующие точки */
router.post('/:loadid', processGetRide);

router.get('/:loadid',  processGetRide);

module.exports = router;
