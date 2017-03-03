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

        db.collection('loadid:' + loadId).find({}, function(r, err) {
          res.send(r);
        });
      }
  });
  
}

/* POST получить существующие точки */
router.post('/:loadid', processGetPoints);

router.get('/:loadid',  processGetPoints);

module.exports = router;
