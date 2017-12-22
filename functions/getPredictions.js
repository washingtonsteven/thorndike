const parseString = require('xml2js').parseString;
const http = require('http');

exports.getPredictions = (callback, stopId=22661) => {

  if (!stopId) stopId = 22661;

  if (typeof stopId === 'string' && (stopId.toLowerCase() === 'thorndike' || stopId === '')) {
    stopId = 22661;
  }

  if (stopId != 22661) {
    if (callback) callback(null); return;
  }

  const nextbusURL = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=mbta&stopId=${stopId}`;

  console.log('reaching out to: '+nextbusURL);

  http.get(nextbusURL, res => {
    let xmldata = "";
    res.on('data', data => {
      console.log("\t got next bus xml data");
      xmldata += data;
    }).on('end', () => {
      console.log("\t next bus xml data complete");

      parseString(xmldata, (err, result) => {
        if (err) {
          console.log('parseString: got err');
          if (callback) {
            callback(null);
          }
          return;
        }

        console.log('parseString result: '+JSON.stringify(result));

        const predictionStrings = result.body.predictions.map(prediction => {
          const routeTitle = prediction.$.routeTitle;
          const stopTitle = prediction.$.stopTitle;

          const directionStrings = prediction.direction.map(direction => {
            const directionTitle = direction.$.title;
            const minutes = direction.prediction.length > 0 ? direction.prediction[0].$.minutes : false;
            const minuteString = minutes === 1 ? 'minute' : 'minutes';
            
            if (minutes !== false)
              return `The next ${routeTitle} to ${directionTitle} is arriving in ${minutes} ${minuteString}`;
            
            return `There is no prediction for ${routeTitle} going to ${directionTitle} at ${stopTitle}`;
          });

          return directionStrings;
        });

        if (callback) {
          callback({ predictions:predictionStrings })
        }
      });
    });
  });
}