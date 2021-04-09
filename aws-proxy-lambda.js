/*
 * Copyright 2021 Sudhir A. Dhumal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
const https = require('https');
const { URL } = require('url');

exports.handler = async (event) => new Promise((resolve, reject) => {
  const parsedUrl = new URL(event.url);

  const options = {
    method: event.verb,
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname,
    headers: event.headers,
    timeout: event.timeout,
  };

  const req = https.request(options, (res) => {
    const chunks = [];

    res.on('data', (chunk) => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      const body = Buffer.concat(chunks);

      const proxyResponse = {
        statusCode: res.statusCode,
        headers: res.headers,
        body: body.toString(),
      };
      resolve(proxyResponse);
    });

    res.on('error', (error) => {
      const proxyResponse = {
        statusCode: 400,
        headers: res.headers || [],
        body: `${error}`,
      };
      reject(proxyResponse);
    });
  });

  const postData = event.data;

  req.write(postData);

  req.end();
});
