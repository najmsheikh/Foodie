var express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_CODE);

var fb = new firebase(process.env.FIREBASE_URL);
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));



app.post('/message', function(req, res){
    console.log(req.body);
    res.end();
});

app.listen(process.env.PORT, function() {
    console.log("Server is up  running at port: " + process.env.PORT);
});
