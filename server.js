var express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_CODE);
var port = process.env.PORT || 1337;

var fb = new firebase('https://foodie1337.firebaseio.com/');
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));



app.post('/message', function(req, res) {
    var msg = req.body.Body;
    var cuisine = getCuisine(msg);

    if (isRequest(msg)) {
        console.log('Tis a novice of ' + getCuisine(msg));

    }

    if (isSubmission(msg)) {
        var number = req.body.From;
        var fbChild = fb.child(cuisine);
        fbChild.push({
            'number': number
        });
        twilio.sms.messages.create({
            to: number,
            from: '+19173381853',
            body: 'Gotcha! So what\'s your name?'
        }, function(err, msg) {
            if (err)
                console.log('Oh crap! Something effed up!');
            if (!err) {
                console.log('\n The message with the ID: \n' +
                    msg.sid +
                    '\n was sucessfully sent to ' + msg.to);
                console.log('The message was: ' + msg.body + '\n')
            };
        });
    };

    nameSave(msg, req.body.From);
});

function isRequest(msg) {
    if ((msg.indexOf('I want to try') > -1) || (msg.indexOf('I would like to try') > -1) || (msg.indexOf('I feel like trying') > -1)) {
        return true;
    }
    return false;
};

function isSubmission(msg) {
    if ((msg.indexOf('I am known for') > -1) || (msg.indexOf('I can help find') > -1) || (msg.indexOf('I can help try') > -1)) {
        return true;
    }
    return false;
}

function getCuisine(msg) {
    if (msg.indexOf('Thai') > 1) return 'Thai';
    if (msg.indexOf('Peruvian') > 1) return 'Peruvian';
    if (msg.indexOf('subcontinental') > 1) return 'subcontinental';
    if (msg.indexOf('Italian') > 1) return 'Italian';
    if (msg.indexOf('Taiwanese') > 1) return 'Taiwanese';
    if (msg.indexOf('Mexican') > 1) return 'Mexican';
    else return 'N/A';
}

function nameSave(msg, number) {
    // var fbChild = fb.child(cuisine);
    // fbChild.once('value', function(datasnap) {
    //     datasnap.forEach(function(snapshot) {
    //         var num = snapshot.child('number').val();
    //         if (num == number) {
    //             // fbChild = fb.ref(snapshot.ref().key());
    //             snapshot.ref().set({
    //                 name: msg,
    //                 number: num
    //             })
    //         } else
    //             console.log('diff num');
    //     });
    // });
    fb.once('value', function(datasnap) {
        datasnap.forEach(function(snapshot) {
            snapshot.forEach(function(snap) {
                var num = snap.child('number').val();
                if (num == number) {
                    // fbChild = fb.ref(snapshot.ref().key());
                    snap.ref().set({
                        name: msg,
                        number: num
                    });
                    // twilio.sms.messages.create({
                    //     to: num,
                    //     from: '+19173381853',
                    //     body: 'Thanks! ' + msg
                    // }, function(err, msg) {
                    //     if (err)
                    //         console.log('Oh crap! Something effed up!');
                    //     if (!err) {
                    //         console.log('\n The message with the ID: \n' +
                    //             msg.sid +
                    //             '\n was sucessfully sent to ' + msg.to);
                    //         console.log('The message was: ' + msg.body + '\n')
                    //     };
                    // });
                } else
                    console.log('diff num');
            })
        })
    })
};

app.listen(port, function() {
    console.log("Server is up  running at port: " + port);
});
