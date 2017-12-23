const parseString = require('xml2js').parseString;
const http = require('http');

const stopMap = {
  'thorndike':{
    stopId:'22661',
    routes:"*"
  },
  'harvard':{
    stopId:'20761',
    routes:["77"]
  },
  'porter':{
    stopId:'23151',
    routes:["77"]
  },
  'south end':{
    stopId:'05093',
    routes:"*"
  },
  'alewife':{
    stopId:'00141',
    routes:["79", "350"]
  }
};


module.exports = (callback, stopName) => {

  if (!stopName || typeof stopName !== 'string') {
    stopName = 'thorndike';
  }

  stopName = stopName.toLowerCase();
  const stopNameTitleCase = stopName.replace(/^[a-z]/, str => str.toUpperCase());
  const currentStop = stopMap[stopName];

  if (!currentStop) {
    callback && callback(null); return;
  }


  const nextbusURL = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=mbta&stopId=${currentStop.stopId}`;

  http.get(nextbusURL, res => {
    let xmldata = "";
    res.on('data', data => {
      xmldata += data;
    }).on('end', () => {

      parseString(xmldata, (err, result) => {
        if (err) {
          if (callback) {
            callback(null);
          }
          return;
        }

        const predictionStrings = result.body.predictions.map(prediction => {
          const routeTitle = prediction.$.routeTitle;
          const stopTitle = prediction.$.stopTitle;

          if (currentStop.routes != "*" && currentStop.routes.indexOf(routeTitle) < 0) {
            return [];
          }

          if (!prediction.direction) {
            return [];
          }

          const directionStrings = prediction.direction.map(direction => {
            const directionTitle = direction.$.title;
            const minutes = direction.prediction.length > 0 ? direction.prediction[0].$.minutes : false;
            const minuteString = minutes === 1 ? 'minute' : 'minutes';
            
            if (minutes !== false)
              return `The next ${routeTitle} to ${directionTitle} at ${stopNameTitleCase} is arriving in ${minutes} ${minuteString}`;
            
            return `There is no prediction for ${routeTitle} going to ${directionTitle} at ${stopTitle}`;
          });

          return directionStrings;
        });

        if (callback) {
          callback({ predictions:predictionStrings });
        }
      });
    });
  });
}