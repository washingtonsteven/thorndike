'use strict';

process.env.DEBUG = 'actions-on-google:*';

const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const getPredictions = require('./getPredictions').getPredictions

const ASK_ACTION = 'ask_stop_by_name';
const STOP_NAME_ARGUMENT = 'stop_name';

exports.askStopByName = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  console.log('Arg: ' + app.getArgument(STOP_NAME_ARGUMENT));
  console.log('Intent: ' + JSON.stringify(request.body.result.metadata.intentName));
  console.log('Reported Intent: ' + app.getIntent())

  let actionMap = new Map();
  actionMap.set(ASK_ACTION, app => {
    let stopName = app.getArgument(STOP_NAME_ARGUMENT);

    console.log('got action: '+ASK_ACTION+' with stopName: '+stopName);

    getPredictions(results => {
      if (!results) {
        app.tell(`Sorry, there we no results for ${stopName}`);
      } else {
        const resultsMessage = results.predictions.map(predictionList => predictionList.join(". ")).join(". ");
        app.tell(resultsMessage);
      }
    }, stopName);
  });

  app.handleRequest(actionMap);
});