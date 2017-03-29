'use strict';
const Alexa = require('alexa-sdk');
const _ = require('lodash');
const request = require('request');
//VI-REMOVE:const VoiceInsights = require('voice-insights-sdk');

const Translations = require('./translations');
const Config = require('./config/skill.config');
const FactsHelper = require('./factsHelper');
const AttributesHelper = require('./attributesHelper');
const ListUtility = require('./listUtility');
const requestHelper = require('./requestHelper.js')

module.exports.handler = (event, context, callback) => {
    // used for testing and debugging only; not a real request parameter
    let useLocalTranslations = event.request.useLocalTranslations || false;

    // get translation resources from translations.json which could be:
    // 1) json file deployed with lambda function
    // 2) json file deployed to s3 bucket
    // 3) one of the above cached in memory with this instance of the lambda function
    Translations.getResources(useLocalTranslations)
        .then(function (data) {

            const alexa = Alexa.handler(event, context);
            alexa.appId = Config.skillAppID;

            //VI-REMOVE:VoiceInsights.initialize(event.session, Config.trackingToken);

            // uncomment to save user values to DynamoDB
            // alexa.dynamoDBTableName = Config.dynamoDBTableName;

            alexa.resources = data; //translations
            alexa.registerHandlers(mainHandlers);
            alexa.execute();
        })
        .catch(function (err) {

            console.log(err.message);
            callback(err.message, null);
        });
};

var mainHandlers = {

    'GetNews' : function(data){
      var News = this.event.request.intent.slots.News.value;
      var ssmlResponse = this.t('news');
      var failResponse = this.t('fail');
      var that = this;

      requestHelper.sendMessage('api/news/'+News,function(success){
        if(success){
          //AttributesHelper.clearRepeat.call(this);
          console.log(success)
          that.emit(':tell', ssmlResponse.speechOutput + News + '.', ssmlResponse.reprompt);
        } else{
          that.emit(':tell', failResponse.speechOutput + News + '.', failResponse.reprompt);
        }
      })
    },
    'GetStock' : function(data){
      var Stock = this.event.request.intent.slots.Stock.value;
      var ssmlResponse = this.t('stock');
      var failResponse = this.t('fail');
      var that = this;

      requestHelper.sendMessage('stock?quote=' + Stock,function(success){
        if(success){
          //AttributesHelper.clearRepeat.call(this);
          console.log(success)
          that.emit(':tell', ssmlResponse.speechOutput + '<say-as interpret-as="spell-out">'+Stock + '</say-as>.', ssmlResponse.reprompt);
        } else{
          that.emit(':tell', failResponse.speechOutput + Stock + '.', failResponse.reprompt);
        }
      })
    },
    'GetCommute' : function(){
      var ssmlResponse = this.t('commute');
      var failResponse = this.t('fail');
      var that = this;

      requestHelper.sendMessage('api/commute',function(success){
        if(success){
          console.log(success)
          //AttributesHelper.clearRepeat.call(this);
          that.emit(':tell', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        } else{
          that.emit(':tell', failResponse.speechOutput, failResponse.reprompt);
        }
      })
    },
    'GetWeather' : function(){
      var ssmlResponse = this.t('weather');
      var failResponse = this.t('fail');
      var city = this.event.request.intent.slots.City.value;
      var state = this.event.request.intent.slots.State.value;
      var that = this;

      requestHelper.sendMessage('api/weather?city='+city+'&state='+state,function(success){
        if(success){
          console.log(success)
          //AttributesHelper.clearRepeat.call(this);
          that.emit(':tell', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        } else{
          that.emit(':tell', failResponse.speechOutput, failResponse.reprompt);
        }
      })
    },
    'GetCalendar' : function(){
      var ssmlResponse = this.t('calendar');
      var failResponse = this.t('fail');
      var that = this;

      requestHelper.sendMessage('calendar',function(success){
        if(success){
          //AttributesHelper.clearRepeat.call(this);
          that.emit(':tell', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        } else{
          that.emit(':tell', failResponse.speechOutput, failResponse.reprompt);
        }
      })
    },
    'LaunchRequest': function () {

        let ssmlResponse = this.t('welcome', this.t('skill.name')); // example of passing a parameter to a string in translations.json

        AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

        //VI-REMOVE:VoiceInsights.track('LaunchRequest', null, ssmlResponse.speechOutput, (error, response) => {
            this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        //VI-REMOVE:});
    },

    'AMAZON.RepeatIntent': function () {

        //VI-REMOVE:let intent = this.event.request.intent;
        let ssmlResponse = AttributesHelper.getRepeat.call(this);

        //VI-REMOVE:VoiceInsights.track(intent.name, null, ssmlResponse.speechOutput, (error, response) => {
            this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt)
        //VI-REMOVE:});
    },

    'AMAZON.HelpIntent': function () {

        //VI-REMOVE:let intent = this.event.request.intent;
        let sampleCommands = this.t('sampleCommands');
        let text = _.sampleSize(sampleCommands, 4).join(' ');
        let speechOutput = this.t('help.speechOutput', text);
        let reprompt = this.t('help.reprompt');

        AttributesHelper.setRepeat.call(this, speechOutput, reprompt);

        //VI-REMOVE:VoiceInsights.track(intent.name, null, speechOutput, (error, response) => {
            this.emit(':ask', speechOutput, reprompt);
        //VI-REMOVE:});
    },

    'AMAZON.CancelIntent': function () {

        //VI-REMOVE:let intent = this.event.request.intent;

        //VI-REMOVE:VoiceInsights.track(intent.name, null, null, (error, response) => {
            this.emit('SessionEndedRequest');
        //VI-REMOVE:});
    },

    'AMAZON.StopIntent': function () {

        //VI-REMOVE:let intent = this.event.request.intent;

        //VI-REMOVE:VoiceInsights.track(intent.name, null, null, (error, response) => {
            this.emit('SessionEndedRequest');
        //VI-REMOVE:});
    },

    'SessionEndedRequest': function () {

        let ssmlResponse = this.t('goodbye', Config.s3.bucketName);

        AttributesHelper.clearRepeat.call(this);

        //VI-REMOVE:VoiceInsights.track('SessionEnd', null, null, (error, response) => {
            this.emit(':tell', ssmlResponse.speechOutput); // :tell* or :saveState handler required here to save attributes to DynamoDB
        //VI-REMOVE:});
    },

    'Unhandled': function () {

        let ssmlResponse = this.t('unhandled');

        AttributesHelper.setRepeat.call(this, ssmlResponse.speechOutput, ssmlResponse.reprompt);

        //VI-REMOVE:VoiceInsights.track('Unhandled', null, ssmlResponse.speechOutput, (error, response) => {
            this.emit(':ask', ssmlResponse.speechOutput, ssmlResponse.reprompt);
        //VI-REMOVE:});
    }
};
