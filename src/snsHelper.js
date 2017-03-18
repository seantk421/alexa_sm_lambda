const pubsub = require('@google-cloud/pubsub')({
  projectId: 'alexa-hack-sm',
  keyFilename: './key.json'
});



'use strict';
const _ = require('lodash');
const util = require('./util');
const Config = require('./config/skill.config');
const request = require('request');
const topic = pubsub.topic('hackathon-topic');
const IP = 'localhost:3000';


module.exports = (function () {
    return {
      sendMessage : function(message,callback){

        topic.publish({
          data: 'Hi Sean'
        }, function(err) {
          console.log('DONE')
        });

      }

    };
})();
