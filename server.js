var express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_CODE);

// var fb = new firebase(process.env.FIREBASE_URL);
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));



app.post('/message', function(req, res) {
    if (isRequest) {
        console.log('Tis a novice!');
    }
    if (isSubmission) {
        console.log('Tis a pro!');
    }
});

function isRequest(msg) {
    if ((msg.indexOf('I want to try out') > -1) || (msg.indexOf('I would like to try') > -1) || (msg.indexOf('I feel like trying') > -1)) {
        return true;
    }
    return false;
};

function isSubmission() {
    if ((msg.indexOf('I am known for') > -1) || (msg.indexOf('I can help find') > -1) || (msg.indexOf('I can help try') > -1)) {
        return true;
    }
    return false;
}


app.listen(process.env.PORT, function() {
    console.log("Server is up  running at port: " + process.env.PORT);
});
