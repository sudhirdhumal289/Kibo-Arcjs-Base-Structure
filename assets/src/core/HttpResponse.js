/* eslint-disable no-underscore-dangle */
const ResponseStatus = require('./ResponseStatus');

module.exports = function HttpResponse(status, response) {
  this.status = status ? ResponseStatus[status.toUpperCase()] || ResponseStatus.COMPLETED : ResponseStatus.COMPLETED;
  this.response = response;
};
