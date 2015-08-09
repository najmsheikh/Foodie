var express = require('express');
var firebase = require('firebase');
var bodyParser = require('body-parser');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_CODE);
var port = process.env.PORT || 1337;

var fb = new firebase('https://foodie1337.firebaseio.com/');
var fbr = new firebase('https://foodie1337request.firebaseio.com/');
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));

app.post('/message', function(req, res) {
    var msg = req.body.Body;
    var number = req.body.From;
    var cuisine = getCuisine(msg);

    if (isGreeting(msg)) {
        twilio.sms.messages.create({
            to: number,
            from: '+19173381853',
            body: 'Heyoo! Just message back saying whether you want to try something or know about some cuisine and we\'ll set you right up'
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
        twilio.sms.messages.create({
            to: number,
            from: '+19173381853',
            body: 'Disclaimer: Once paired, we gotta share your # to your fellow foodie so they can contact you.'
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
    }

    if (isRequest(msg)) {
        var fbChild = fbr.child(cuisine);
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
        twilio.sms.messages.create({
            to: number,
            from: '+19173381853',
            body: 'Finding you people for ' + cuisine + ' food! When you wanna stop search, message back \'STOP\''
        }, function(err, msg) {});
        sendInvites(cuisine);
    }

    if (isSubmission(msg)) {
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

    if (isGoing(msg)) {
        var fbChild = fbr.child(cuisine);
        fbChild.once('value', function(datasnap) {
            datasnap.forEach(function(snapshot) {
                var name = snapshot.child('name').val();
                var num = snapshot.child('number').val();
                twilio.sms.messages.create({
                    to: num,
                    from: '+19173381853',
                    body: 'Hey ' + name + ', someone wants to try out ' + cuisine + ' food with you. Call em at ' + number
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
            });
        });
    }

    if (isDone(msg)) {

    } else if (!isSubmission(msg) && !isRequest(msg) && !isGreeting(msg) && !isGoing(msg)) {
        nameSave(msg, req.body.From);
    }
});

function isGreeting(msg) {
    if (msg.indexOf('foodie') > -1 || msg.indexOf('Yo') > -1) {
        return true;
    }
    return false;
}

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

function isGoing(msg) {
    if (msg.indexOf('I\'ll go') > -1) {
        return true;
    }
    return false;
}

function isDone(msg) {
    if (msg.indexOf('STOP') > -1) {
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

function getName(number, callback) {
    fb.once('value', function(datasnap) {
        datasnap.forEach(function(snapshot) {
            snapshot.forEach(function(snap) {
                var num = snap.child('number').val();
                if (num == number) {
                    callback(snap.child('name').val());
                    return true;
                }
            })
        })
    })
}

function sendInvites(cuisine) {
    var fbChild = fb.child(cuisine);
    fbChild.once('value', function(datasnap) {
        datasnap.forEach(function(snapshot) {
            var name = snapshot.child('name').val();
            var num = snapshot.child('number').val();
            twilio.sms.messages.create({
                to: num,
                from: '+19173381853',
                body: 'Hey ' + name + ', someone wants to try out ' + cuisine + ' food. If you wanna be a foodie, reply saying \'I\'ll go for ' + cuisine + ' food.\''
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
        });
    });
}

function nameSave(msg, number) {
    fb.once('value', function(datasnap) {
        datasnap.forEach(function(snapshot) {
            snapshot.forEach(function(snap) {
                var num = snap.child('number').val();
                if (num == number) {
                    snap.ref().set({
                        name: msg,
                        number: num
                    });
                } else
                    console.log('diff num');
            })
        })
    })
    fbr.once('value', function(datasnap) {
        datasnap.forEach(function(snapshot) {
            snapshot.forEach(function(snap) {
                var num = snap.child('number').val();
                if (num == number) {
                    snap.ref().set({
                        name: msg,
                        number: num
                    });
                } else
                    console.log('diff num');
            })
        })
    })
};

app.post('/test', function(req, res) {
    var user = '';
    getName('+15163600019', function(name) {
        user = name;
    })
    console.log(user);
    res.end();
})

app.listen(port, function() {
    console.log("Server is up  running at port: " + port);
});
