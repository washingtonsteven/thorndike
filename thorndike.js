const App = require('actions-on-google').DialogflowApp;
const getPredictions = require('./getPredictions');

const ASK_ACTION = 'ask_stop_by_name';
const STOP_NAME_ARGUMENT = 'stop_name';

module.exports = (request, response) => {
  const app = new App({request, response});
  console.log('Body: ' + JSON.stringify(request.body));

  let actionMap = new Map();
  actionMap.set(ASK_ACTION, app => {
    let stopName = app.getArgument(STOP_NAME_ARGUMENT);

    getPredictions(results => {

      if (!results || !results.predictions) {
        app.tell(`Sorry, I don't have information for ${stopName}`);
      } else {
        let resultsMessage = results.predictions.map(predictionList => predictionList.filter(l => l.length > 0).join(". ")).filter(l => l.length > 0).join(". ");
        resultsMessage = resultsMessage.replace(/\s\s+/g, ' ').trim();

        if (resultsMessage.length > 0)
          app.tell(resultsMessage);
        else
          app.tell(`There don't seem to be any buses at ${stopName}`);
      }
    }, stopName);
  });

  app.handleRequest(actionMap);
}