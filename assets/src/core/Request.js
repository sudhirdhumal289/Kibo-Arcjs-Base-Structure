const http = require('http');
const https = require('https');
const urlInstance = require('url');

module.exports = function request(options) {
  if (!options || !options.url) return null;

  const {
    timeout, headers, verb, url, key, cert, expectJson,
  } = options;

  const expectJsonOpt = (expectJson === undefined || expectJson === null) ? true : expectJson;

  let { data } = options;

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line node/no-deprecated-api
    const parsedUrl = urlInstance.parse(url);

    let reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.path,
      method: verb || 'GET',
    };

    const httpHandle = parsedUrl.protocol.startsWith('https') || parsedUrl.protocol.startsWith('sftp') ? https : http;
    if (parsedUrl.protocol.startsWith('https') || parsedUrl.protocol.startsWith('sftp')) {
      reqOptions.rejectUnauthorized = false;
      reqOptions.requestCert = true;
      reqOptions.agent = false;
      reqOptions.port = parsedUrl.port || 443;
    }

    if (headers) {
      reqOptions.headers = headers;
    }

    if (key) {
      reqOptions.key = key;
    }

    if (cert) {
      reqOptions.cert = cert;
    }

    if (global.proxyServer && url !== global.logServer) {
      data = JSON.stringify(options);
      // eslint-disable-next-line node/no-deprecated-api
      const parsedProxyUrl = urlInstance.parse(global.proxyServer);
      reqOptions = {
        hostname: parsedProxyUrl.hostname,
        port: parsedProxyUrl.port ? parsedProxyUrl.port : 80,
        path: parsedProxyUrl.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };
      if (parsedProxyUrl.protocol.startsWith('https') || parsedProxyUrl.protocol.startsWith('sftp')) {
        reqOptions.rejectUnauthorized = false;
        reqOptions.requestCert = true;
        reqOptions.agent = false;
        reqOptions.port = parsedUrl.port || 443;
      }
    }

    const reqClient = httpHandle.request(reqOptions, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        let endpointResponse = Buffer.concat(chunks).toString();

        if (global.proxyServer && url !== global.logServer) {
          endpointResponse = JSON.parse(endpointResponse); // Proxy server is always going to return JSON

          if (endpointResponse.statusCode >= 400) {
            reject(endpointResponse.body);
          } else {
            endpointResponse = endpointResponse.body;

            if (expectJsonOpt) {
              try {
                endpointResponse = JSON.parse(endpointResponse);
              } catch (e) {
                // ignore - non-JSON response
              }
            }

            resolve(endpointResponse);
          }
        } else {
          if (expectJsonOpt) {
            try {
              endpointResponse = JSON.parse(endpointResponse);
            } catch (e) {
              // ignore - non-JSON response
            }
          }

          resolve(endpointResponse);
        }
      });
    });

    if (timeout && timeout > 0) {
      reqClient.setTimeout(timeout, () => {
        reject(new Error('Request timed out.'));
      });
    }

    reqClient.on('error', (err) => {
      // Check if retry is needed
      // (we dont have to check for infinite retry as Arc.js can survive only for 32 seconds)
      if (reqClient.reusedSocket && err.code === 'ECONNRESET' && options.retry) {
        request(options)
          .then(resolve)
          .catch(reject);
      } else {
        // eslint-disable-next-line no-console
        console.error(err.message);
        reject(err);
      }
    });

    if (data) {
      // // eslint-disable-next-line node/no-deprecated-api,no-nested-ternary
      // const dataToWrite = typeof data === 'string' ? new Buffer(data)
      //   // eslint-disable-next-line node/no-deprecated-api
      //   : (Buffer.isBuffer(data) ? data : new Buffer(JSON.stringify(data)));
      reqClient.write(data);
    }

    reqClient.end();
  });
};
