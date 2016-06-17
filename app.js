/*
Juni AI-Asistant

*/

var express = require('express');

var config = require("./config.json");

var app = express();

app.use('/*.json', function(req, res) {
  res.redirect('/');
});


app.post('/search', function(req, res) {
  if(req.body.search === undefined) return res.send({success: false });
});

app.use('/', express.static(__dirname + "/public/"));

app.listen(3000, function () {
  console.log('Juni Running');
});
