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
  //https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=APIkey&lang=en-ru&text=time
  //
  console.log("Example requested from API");
  var api_results = {
    "word": "example",
    "results": [
      {
        "definition": "a representative form or pattern",
        "partOfSpeech": "noun",
        "synonyms": [
          "model"
        ],
        "typeOf": [
          "representation",
          "internal representation",
          "mental representation"
        ],
        "hasTypes": [
          "prefiguration",
          "archetype",
          "epitome",
          "guide",
          "holotype",
          "image",
          "loadstar",
          "lodestar",
          "microcosm",
          "original",
          "paradigm",
          "pilot",
          "prototype",
          "template",
          "templet",
          "type specimen"
        ],
        "derivation": [
          "exemplify"
        ],
        "examples": [
          "I profited from his example"
        ]
      },
      {
        "definition": "something to be imitated",
        "partOfSpeech": "noun",
        "synonyms": [
          "exemplar",
          "good example",
          "model"
        ],
        "typeOf": [
          "ideal"
        ],
        "hasTypes": [
          "pacemaker",
          "pattern",
          "beauty",
          "prodigy",
          "beaut",
          "pacesetter"
        ],
        "derivation": [
          "exemplify",
          "exemplary"
        ]
      },
      {
        "definition": "an occurrence of something",
        "partOfSpeech": "noun",
        "synonyms": [
          "case",
          "instance"
        ],
        "typeOf": [
          "happening",
          "natural event",
          "occurrence",
          "occurrent"
        ],
        "hasTypes": [
          "clip",
          "mortification",
          "piece",
          "time",
          "humiliation",
          "bit"
        ],
        "derivation": [
          "exemplify"
        ],
        "examples": [
          "but there is always the famous example of the Smiths"
        ]
      },
      {
        "definition": "an item of information that is typical of a class or group",
        "partOfSpeech": "noun",
        "synonyms": [
          "illustration",
          "instance",
          "representative"
        ],
        "typeOf": [
          "information"
        ],
        "hasTypes": [
          "excuse",
          "apology",
          "specimen",
          "case in point",
          "sample",
          "exception",
          "quintessence",
          "precedent"
        ],
        "derivation": [
          "exemplify",
          "exemplary"
        ],
        "examples": [
          "this patient provides a typical example of the syndrome",
          "there is an example on page 10"
        ]
      },
      {
        "definition": "punishment intended as a warning to others",
        "partOfSpeech": "noun",
        "synonyms": [
          "deterrent example",
          "lesson",
          "object lesson"
        ],
        "typeOf": [
          "monition",
          "admonition",
          "word of advice",
          "warning"
        ],
        "derivation": [
          "exemplary"
        ],
        "examples": [
          "they decided to make an example of him"
        ]
      },
      {
        "definition": "a task performed or problem solved in order to develop skill or understanding",
        "partOfSpeech": "noun",
        "synonyms": [
          "exercise"
        ],
        "typeOf": [
          "lesson"
        ],
        "examples": [
          "you must work the examples at the end of each chapter in the textbook"
        ]
      }
    ],
    "syllables": {
      "count": 3,
      "list": [
        "ex",
        "am",
        "ple"
      ]
    },
    "pronunciation": {
      "all": "ÉªÉ¡'zÃ¦mpÉ™l"
    },
    "frequency": 4.67
  }
  res.setHeader('Content-Type', 'application/json');
  res.send(api_results);
});

app.use('/api/*/*', function(req, res) {
  console.log("API requested from search");
  var url = req.originalUrl.substring(5);
  var type = url.split("/")[0];
  var word = url.split("/")[1];
  var api_url = "http://words.bighugelabs.com/api/2/" + config.dictionaryAPIToken + "/" + word + "/json";
  switch(type) {
    case "q":
      break;
    case "s":
      request({
          url: api_url,
          json: true
      }, function (error, response, api_results) {
        console.log(api_results);
        if (!error && response.statusCode === 200) {
            var results = [];
            //bighugelabs
            for(var k in api_results) {
              results = results.concat(api_results[k].syn)
            };
            /* Wordsapi
            // for(var i = 0; i < api_results.results.length; i++) {
            //   for(var j = 0; j < api_results.results[i].synonyms.length; j++) {
            //       results.push(api_results.results[i].synonyms[j]);
            //   }
            // }
            */
            res.send({success: true, type: "synonym", data: results});
        } else {
          res.send({success: false, error: "API Run out or unactivated."});
        }
      });
      break;
    case "a":
      request({
          url: api_url,
          json: true
      }, function (error, response, api_results) {
        if (!error && response.statusCode === 200) {
            var results = [];
            //bighugelabs
            for(var k in api_results) {
              results = results.concat(api_results[k].ant)
            };
            res.send({success: true, type: "synonym", data: results});
        } else {
          res.send({success: false, error: "API Run out or unactivated."});
        }
      });
      break;
    case "r":
      break;
    case "d":
      var results = [];
      request({
          url: url,
          json: true
      }, function (error, api_results, body) {
        for(var i = 0; i < api_results.results.length; i++) {
            results.push(api_results.results[i].definition);
        }
      })
      break;
    default:
      error: {
        message: "Command does not exist";
      }
  }
});

app.post('/search', function(req, res) {
  console.log("Search requested from user");
  if(req.body.type === undefined || req.body.value === undefined) return res.send({success: false });
  var reqQuery =  req.body.value;
  var url = "http://localhost:3000" + "/api/" + req.body.type + "/" + reqQuery;
  request({
      url:  url,
      json: true
  }, function (error, response, results) {
    console.log("Response");
    if (!error && response.statusCode === 200) {
        res.send({success: results.success, type: results.type, query: reqQuery, result: results.data, error: results.error});
    }
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
