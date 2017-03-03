var mongodb = require('mongodb'),
    express = require('express');

var app = express();

class Answer {

}

app.get('/', function(req, res) {
    res.send('The river’s tent is broken');
})

app.post('startRide', function(req, res){
    res.send()
})