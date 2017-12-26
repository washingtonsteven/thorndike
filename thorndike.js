const googleAction = require('./googleAction');
const iftttAction = require('./iftttAction');

module.exports = (request, response) => {
  if (request.params.service === 'google') {
    googleAction(request, response);
  } else if (request.params.service === 'ifttt') {
    iftttAction(request, response);
  } else {
    response.json({ err:'No valid service specified', service:request.params.service || false });
  }
}

