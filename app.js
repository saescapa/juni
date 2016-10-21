/*
Juni AI-Asistant

*/
'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require("request");
var http = require("http");

var JsonDB = require('node-json-db');
var database = new JsonDB("database/", true, false); //load up the database

var config = require("./config.json");

// const Synonymator = require("../");
// const API_KEY = config.SynonymatorAPI;
//
// let syn = new Synonymator(API_KEY);

var app = express();

var secretToken = config.secretToken

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/*.json', function(req, res) {
  res.redirect('/');
});

app.use('/bhl_api/', function(req, res) {
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

app.use('/dtm_api/', function(req, res) {
  var api_results = [
     {
        "word":"pass",
        "score":1598
     },
     {
        "word":"drop",
        "score":1194
     },
     {
        "word":"settle",
        "score":1119
     },
     {
        "word":"dip",
        "score":897
     }
  ];
  res.setHeader('Content-Type', 'application/json');
  res.send(api_results);
});

app.use('/avt_api/', function(req, res) {
  var api_results = {
    "response":[
      {
         "list":{
            "category":"(verb)",
            "synonyms":"eat|consume|ingest|take in|take|have"
         }
      },
      {
         "list":{
            "category":"(verb)",
            "synonyms":"consume|ingest|take in|take|have|eat in (related term)|eat out (related term)|eat up (related term)"
         }
      },
      {
         "list":{
            "category":"(verb)",
            "synonyms":"feed|consume|ingest|take in|take|have"
         }
      },
      {
         "list":{
            "category":"(verb)",
            "synonyms":"consume|eat up|use up|deplete|exhaust|run through|wipe out|spend|expend|drop"
         }
      },
      {
         "list":{
            "category":"(verb)",
            "synonyms":"eat on|worry|vex"
         }
      },
      {
         "list":{
            "category":"(verb)",
            "synonyms":"corrode|rust|damage"
         }
      }
    ]
  };
  res.setHeader('Content-Type', 'application/json');
  res.send(api_results);
});

app.post('/api/:type/:word/:topic?', function(req, res) {
  var url = req.originalUrl.substring(5);
  var type = req.params.type;
  var word = req.params.word;
  var topic = req.params.topic ? req.params.topic : "";
  console.log("API requested, type: " + type + "; word: " + word + "; topic: " + topic);
  var api_urls = {
    "api_bhl": {
      "url": "http://words.bighugelabs.com/api/2/" + config.dictionaryAPIToken + "/" + word + "/json",
      phrases: false,
      types: ["synonym", "antonym"],
    },
    "api_avt": {
      "url": "http://thesaurus.altervista.org/thesaurus/v1?word=" + word + "&language=en_US&key=" + config.altervistaAPIKey + "/output=json",
      phrases: false,
      types: ["synonym", "antonym"],
    },
    "api_dtm": {
      "url": "http://api.datamuse.com/words?rel_rhy=" + word + "&max=10",
      phrases: false,
      types: ["rhyme"]
    }
  };
  var api_urls_t = {
    "api_bhl": {
      "url": "http://localhost:5000/bhl_api/",
      phrases: false
    },
    "api_avt": {
      "url": "http://localhost:5000/avt_api/",
      phrases: false
    },
    "api_dtm": {
      "url": "http://localhost:5000/dtm_api/",
      phrases: false
    },
  };
  switch(type) {
    case "a":
    case "s":
      if(!api_urls["api_bhl"].phrases && word.indexOf("%20") !== -1) return res.send({success: false, error: "Invalid Format."});
      request({
          url: api_urls["api_bhl"].url,
          json: true
      }, function (error, response, api_results) {
        if (!error && response.statusCode === 200) {
            var results = {};
            /*bighugelabs*/
            for(var k in api_results) {
              for(var l in api_results[k]) {
                if(!results[l.charAt(0)]) results[l.charAt(0)] = []
                results[l.charAt(0)] = results[l.charAt(0)].concat(api_results[k][l]);
              }
            };

            /* Result Formatting -> Replaces all spaces with an _, mostly for multiple word replacements and  */
            for(var h in results) {
              for(var i = 0; i < results[h].length; i++) {
                results[h][i] = results[h][i].replace(/\s/g,"_") + "_";
              }
            }
            if(!results[type]) return res.send({success: false, error: "No data collected", error_message: ""});
            return res.send({success: true, type: "synonyms|antonym", data: results});
        }
        return res.send({success: false, error: "Error in Foreign API", error_message: error});
      });
      break;
    case "r":
      if(!api_urls["api_dtm"].phrases && word.indexOf("%20") !== -1) return res.send({success: false, error: "Invalid Format."});
      request({
          url: api_urls["api_dtm"].url,
          json: true
      }, function (error, response, api_results) {
        if (!error && response.statusCode === 200) {
            var results = {};
            for(var k in api_results) {
              if(!results["r"]) results["r"] = []
              results["r"] = results["r"].concat(api_results[k]["word"]);
            };
            /*bighugelabs DEPRECATED
            for(var k in api_results) {
              for(var l in api_results[k]) {
                if(!results[l.charAt(0)]) results[l.charAt(0)] = []
                results[l.charAt(0)] = results[l.charAt(0)].concat(api_results[k][l]);
              }
            };*/
            /* Wordsapi DEPRECATED
            // for(var i = 0; i < api_results.results.length; i++) {
            //   for(var j = 0; j < api_results.results[i].synonyms.length; j++) {
            //       results.push(api_results.results[i].synonyms[j]);
            //   }
            // }
            */

            /* Result Formatting -> Replaces all spaces with an _, mostly for multiple word replacements and  */
            for(var h in results) {
              for(var i = 0; i < results[h].length; i++) {
                results[h][i] = results[h][i].replace(/\s/g,"_") + "_";
              }
            }
            if(!results[type]) return res.send({success: false, error: "No data collected", error_message: ""});
            return res.send({success: true, type: "rhyme", data: results});
        }
        return res.send({success: false, error: "Error in Foreign API", error_message: error});
      });
      break;
    /* DEPRECATED*/
    // case "r":
      // if(!api_urls_t["api_dtm"].phrases && word.indexOf("%20") !== -1) return res.send({success: false, error: "Invalid Format."});
      // request({
      //     url: api_urls_t["api_dtm"].url,
      //     json: true
      // }, function (error, response, api_results) {
      //   if (!error && response.statusCode === 200) {
      //       var results = {};
      //       /*datamuseAPI DEPRECATED
      //       for(var k = 0; k < api_results.length; k++) {
      //           if(!results["r"]) results["r"] = [];
      //           results["r"] = results["r"].concat(api_results[k].word);
      //       };*/
      //
      //
      //       /* Result Formatting -> Replaces all spaces with an _, mostly for multiple word replacements and  */
      //       for(var h in results) {
      //         for(var i = 0; i < results[h].length; i++) {
      //           results[h][i] = results[h][i].replace(/\s/g,"_") + "_";
      //         }
      //       }
      //       /* Wordsapi DEPRECATED
      //       for(var i = 0; i < api_results.results.length; i++) {
      //         for(var j = 0; j < api_results.results[i].synonyms.length; j++) {
      //             results.push(api_results.results[i].synonyms[j]);
      //         }
      //       }*/
      //       if(!results[type]) return res.send({success: false, error: "No data collected", error_message: ""});
      //       return res.send({success: true, type: "rhyme", data: results});
      //   }
      //   return res.send({success: false, error: "Error in Foreign API", error_message: error});
      // });
      // break;
    default:
      return res.send({success: false, error: "Command not supported."});
  }
});

app.get('/search', function(req, res) {
  if(req.query.type === undefined || req.query.value === undefined || req.query.topic === undefined) return res.send({success: false });
  var reqQuery =  req.query.value;
  var url = config.homeURL + "/api/" + req.query.type + "/" + reqQuery + "/" + req.query.topic;
  request({
      url:  url,
      method: "POST",
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
