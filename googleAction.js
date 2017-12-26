const App = require('actions-on-google').DialogflowApp;
const { getPredictions, stringifyPredictions } = require('./getPredictions');

const ASK_ACTION = 'ask_stop_by_name';
const STOP_NAME_ARGUMENT = 'stop_name';

module.exports = (request, response) => {
  const app = new App({request, response});

  let actionMap = new Map();
  actionMap.set(ASK_ACTION, app => {
    let stopName = app.getArgument(STOP_NAME_ARGUMENT);

    getPredictions(stopName)
      .then(results => stringifyPredictions(results))
      .then(resultsMessage => {
        if (resultsMessage === false) {
          app.tell(`There don't seem to be any buses at ${stopName}`);
        } else if (!resultsMessage) {
          app.tell(`Sorry, I don't have information for ${stopName}`);
        } else {
          app.tell(resultsMessage);
        }
      });
  });

  app.handleRequest(actionMap);
}