const http = require('http');
const https = require('https');
const urlInstance = require('url');

module.exports = function request(options) {
  if (!options || !options.url) return null;

  const {
    timeout, headers, secure, data, verb, url, key, cert,
  } = options;

  const httpHandle = secure ? https : http;

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line node/no-deprecated-api
    const parsedUrl = urlInstance.parse(url);

    if (timeout && timeout > 0) {
      setTimeout(() => {
        reject(new Error('Request timed out.'));
      }, timeout);
    }

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port ? parsedUrl.port : 80,
      path: parsedUrl.path,
      method: verb || 'GET',
    };

    if (headers) {
      reqOptions.headers = headers;
    }

    if (key) {
      reqOptions.key = key;
    }

    if (cert) {
      reqOptions.cert = cert;
    }

    const reqClient = httpHandle.request(reqOptions, (response) => {
      let responseData = '';

      response.on('data', (chunk) => {
        responseData += chunk;
      });
      response.on('end', (endResponse) => {
        if (!endResponse.complete) {
          const errMsg = 'The connection was terminated while the message was still being sent';
          // eslint-disable-next-line no-console
          console.error(errMsg);
          reject(new Error(errMsg));

          return;
        }

        resolve(responseData);
      });
    });

    reqClient.on('error', (err) => {
      // Check if retry is needed
      // (we dont have to check for infinite retry as Arc.js can survive only for 32 seconds)
      if (reqClient.reusedSocket && err.code === 'ECONNRESET' && options.retry) {
        request(options);
      } else {
        reject(err);
      }
    });

    if (data) {
      reqClient.write(data);
    }

    reqClient.end();
  });
};
