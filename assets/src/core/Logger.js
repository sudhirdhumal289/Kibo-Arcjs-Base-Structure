/* eslint-disable no-console */
const request = require('./Request');

class Logger {
  logMessage(message, logLevel) {
    if (global && global.logServer) {
      const reqData = JSON.stringify({
        log: message,
        logLevel,
      });
      const requestOptions = {
        data: reqData,
        verb: 'POST',
        url: global.logServer,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': reqData.length,
        },
        retry: false,
      };

      const promise = request(requestOptions);

      let isResolved;

      promise.then(() => {
        isResolved = true;
      });
      promise.catch(() => {
        isResolved = true;
      });

      // Loop to make sure request get delivered in time
      for (let i = 0; i < 2000; i += 1) {
        const tmp = i;
        i *= Math.random();
        i = tmp;

        if (isResolved) break;
      }
    } else if (logLevel === 'critical') {
      console.error(message);
    } else {
      console[logLevel](message);
    }
  }

  info(message) {
    this.logMessage(message, 'info');
  }

  warn(message) {
    this.logMessage(message, 'warn');
  }

  error(message) {
    this.logMessage(message, 'error');
  }

  critical(message) {
    this.logMessage(message, 'critical');
  }

  log(message) {
    this.logMessage(message, 'log');
  }
}

module.exports = Logger;
