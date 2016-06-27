/*
Juni AI-Asistant

*/
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require("request");
var http = require("http");

var storage = require('node-persist'); //Storage to keep logs

var config = require("./config.json");

// const Synonymator = require("../");
// const API_KEY = config.SynonymatorAPI;
//
// let syn = new Synonymator(API_KEY);

var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/*.json', function(req, res) {
  res.redirect('/');
});

app.use('/example/', function(req, res) {
  var api_results = {
    "noun": {
      "syn": [
        "passion",
        "beloved",
        "dear",
        "dearest",
        "honey",
        "sexual love",
        "erotic love",
        "lovemaking",
        "making love",
        "love life",
        "concupiscence",
        "emotion",
        "eros",
        "loved one",
        "lover",
        "object",
        "physical attraction",
        "score",
        "sex",
        "sex activity",
        "sexual activity",
        "sexual desire",
        "sexual practice"
      ],
      "ant": [
        "hate"
      ],
      "usr": [
        "amour"
      ]
    },
    "verb": {
      "syn": [
        "love",
        "enjoy",
        "roll in the hay",
        "make out",
        "make love",
        "sleep with",
        "get laid",
        "have sex",
        "know",
        "do it",
        "be intimate",
        "have intercourse",
        "have it away",
        "have it off",
        "screw",
        "jazz",
        "eff",
        "hump",
        "lie with",
        "bed",
        "have a go at it",
        "bang",
        "get it on",
        "bonk",
        "copulate",
        "couple",
        "like",
        "mate",
        "pair"
      ],
      "ant": [
        "hate"
      ]
    }
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(api_results);
});

app.use('/api/*/*', function(req, res) {
  var url = req.originalUrl.substring(5);
  var type = url.split("/")[0];
  var word = url.split("/")[1];
  console.log("API requested, type: " + type + "; word: " + word);
  var api_url = "http://words.bighugelabs.com/api/2/" + config.dictionaryAPIToken + "/" + word + "/json";
  //var api_url = "http://localhost:5000/example";
  switch(type) {
    case "a":
    case "s":
      request({
          url: api_url,
          json: true
      }, function (error, response, api_results) {
        if (!error && response.statusCode === 200) {
            var results = {};
            //bighugelabs
            for(var k in api_results) {
              for(var l in api_results[k]) {
                if(!results[l.charAt(0)]) results[l.charAt(0)] = []
                results[l.charAt(0)] = results[l.charAt(0)].concat(api_results[k][l]);
              }
            };
            for(var h in results) {
              for(var i = 0; i < results[h].length; i++) {
                results[h][i] = results[h][i].replace(/\s/g,"_") + "_";
              }
            }
            /* Wordsapi
            // for(var i = 0; i < api_results.results.length; i++) {
            //   for(var j = 0; j < api_results.results[i].synonyms.length; j++) {
            //       results.push(api_results.results[i].synonyms[j]);
            //   }
            // }
            */
            return res.send({success: true, type: "synonym|antonym", data: results});
        }
        return res.send({success: false, error: "Error in Foreign API", error_message: error});
      });
      break;
    default:
      return res.send({success: false, error: "Command not supported."});
  }
});

app.post('/search', function(req, res) {
  if(req.body.type === undefined || req.body.value === undefined) return res.send({success: false });
  var reqQuery =  req.body.value;
  var url = config.homeURL + "/api/" + req.body.type + "/" + reqQuery;
  request({
      url:  url,
      json: true
  }, function (error, response, results) {
    if (!error && response.statusCode === 200) {
        return res.send({success: results.success, type: results.type, query: reqQuery, result: results.data, error: results.error});
    }
    return res.send({success: false, error: "Error in local API.", error_message: error});
  })
});

app.use('/', express.static(__dirname + "/public/"));

app.use('/api/*', function(req, res) {
  res.send('Error');
});

app.use('/*', function(req, res) {
  res.redirect('/');
});

app.listen(app.get('port'), function() {
  console.log('Juni is running on port', app.get('port'));
});
