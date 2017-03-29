'use strict';
const _ = require('lodash');
const util = require('./util');
const Config = require('./config/skill.config');
const request = require('request');

const url = 'https://alexa-hack-sm-vproohsuao.now.sh';


module.exports = (function () {
    return {
      sendMessage : function(path,callback){
        var options = {
          method: 'POST',
          url: url + '/' + path
        };
        console.log(JSON.stringify(options));
        request(options, function(error, response, body) {
          if (error){
            callback(false)
          }

          if(body) {
            callback(body);
          } else {
            callback(false);
          }
        });
      }
    };
})();
