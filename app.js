'use strict';

var express = require('express');
var app = express();
var auth = require('http-auth');


// var basic = auth.basic({
//   realm: 'SUPER SECRET STUFF'
// }, function(username, password, callback) {
//   callback(username == 'tommy' && password == 'team--tommy');
// });

// app.use("/", auth.connect(basic));
app.use(express.static('www'));

app.set('port', (process.env.PORT || 4001));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});