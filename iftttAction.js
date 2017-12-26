const { getPredictions, stringifyPredictions } = require('./getPredictions');
const request = require('request-promise');
require('dotenv').config();

const eventName = 'notify';
const ifttt_webhook_url = `https://maker.ifttt.com/trigger/${eventName}/with/key/${process.env.IFTTT_API_KEY}`

module.exports = (req, res) => {
  console.log(JSON.stringify(req.body, null, 1));
  const stopName = req.body.stopName;
  getPredictions(stopName)
    .then(results => stringifyPredictions(results))
    .then(resultsMessage => {
      let notificationText = "";
      if (resultsMessage === false) {
        notificationText = `There don't seem to be any buses at ${stopName}`;
      } else if (!resultsMessage) {
        notificationText = `Sorry, I don't have information for ${stopName}`;
      } else {
        notificationText = resultsMessage;
      }

      request({
        uri:ifttt_webhook_url,
        method:'POST',
        body:{ 'value1':notificationText },
        json:true
      }).then(ifttt_response => {
        res.json({ msg:'Sent request to IFTTT', notificationText, ifttt_response });
      });
    });
}