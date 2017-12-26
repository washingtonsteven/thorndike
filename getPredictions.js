const xml2js = require('xml2js-es6-promise');
const request = require('request-promise');
const Promise = require('bluebird');

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
  },
  'downtown':{
    stopId:'49001',
    routes:"*"
  }
};


exports.getPredictions = stopName => { 
  if (!stopName || typeof stopName !== 'string') {
    stopName = 'thorndike';
  }

  stopName = stopName.toLowerCase();
  stopName = Object.keys(stopMap).filter(s => stopName.indexOf(s) >=0)[0];

  const currentStop = stopMap[stopName];
  if (!currentStop) {
    return new Promise((resolve, reject) => { resolve(null); });
  }

  const stopNameTitleCase = stopName.replace(/^[a-z]/, str => str.toUpperCase());
  const stopInfo = { currentStop, stopNameTitleCase }

  

  const nextbusURL = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=mbta&stopId=${currentStop.stopId}`;

  return request(nextbusURL)
            .then(xml => xml2js(xml))
            .then(json => parseSchedule(json, stopInfo))
}

exports.stringifyPredictions = (results, joiner = ". ") => {
  if (!results) {
    return null;
  } else {
    let resultsMessage = results.map(predictionList => predictionList.filter(l => l.length > 0).join(joiner)).filter(l => l.length > 0).join(joiner);
    resultsMessage = resultsMessage.replace(/\s\s+/g, ' ').trim();

    if (resultsMessage.length > 0) 
      return resultsMessage;
    else 
      return false;
  }
}

const parseSchedule = (result, stopInfo) => {
  const { currentStop, stopNameTitleCase } = stopInfo;
  const predictionStrings = result.body.predictions.map(prediction => {
    const routeTitle = prediction.$.routeTitle;
    const stopTitle = prediction.$.stopTitle;

    if (currentStop.routes !== "*" && currentStop.routes.indexOf(routeTitle) < 0) {
      return [];
    }

    if (!prediction.direction) {
      return [];
    }

    const directionStrings = prediction.direction.map(direction => {
      const directionTitle = direction.$.title;
      const minutes = direction.prediction.length > 0 ? direction.prediction[0].$.minutes : false;
      const minuteString = minutes ==="1" ? 'minute' : 'minutes';
      
      if (minutes !== false)
        return `The next ${routeTitle} to ${directionTitle} at ${stopNameTitleCase} is arriving in ${minutes} ${minuteString}`;
      
      return `There is no prediction for ${routeTitle} going to ${directionTitle} at ${stopTitle}`;
    });

    return directionStrings;
  });

  return predictionStrings;
}