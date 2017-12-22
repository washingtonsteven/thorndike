const App = require('actions-on-google').DialogflowApp;
const getPredictions = require('./getPredictions');

const ASK_ACTION = 'ask_stop_by_name';
const STOP_NAME_ARGUMENT = 'stop_name';

module.exports = (request, response) => {
  const app = new App({request, response});

  let actionMap = new Map();
  actionMap.set(ASK_ACTION, app => {
    let stopName = app.getArgument(STOP_NAME_ARGUMENT);

    getPredictions(results => {
      if (!results || !results.predictions) {
        app.tell(`Sorry, there were no results for ${stopName}`);
      } else {
        const resultsMessage = results.predictions.map(predictionList => predictionList.join(". ")).join(". ");
        app.tell(resultsMessage);
      }
    }, stopName);
  });

  app.handleRequest(actionMap);
}