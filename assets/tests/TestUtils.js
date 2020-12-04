/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-unpublished-require */
const chai = require('chai');
const nock = require('nock');

const { assert } = chai;

class TestUtils {
  async assertThrowsAsync(fn, regExp) {
    let f = () => {
    };
    try {
      if (fn.then) {
        await fn;
      } else {
        await fn();
      }
    } catch (e) {
      f = () => {
        throw e || new Error('Something went wrong.');
      };
    } finally {
      assert.throws(f, regExp);
    }
  }

  resetNock(baseUrl) {
    nock.cleanAll();

    const response = {};
    this.getNockInstance(baseUrl)
      .post('/api/platform/applications/authtickets/?responseFields=')
      .reply(200, response);

    this.getNockInstance(baseUrl)
      .post('/api/platform/applications/authtickets/')
      .reply(200, response);

    this.getNockInstance(baseUrl)
      .get('/api/platform/tenants/123?responseFields=')
      .reply(200, response);
  }

  getNockInstance(baseUrl) {
    return nock(baseUrl)
      .persist(true)
      .defaultReplyHeaders({
        'Content-Type': 'application/json',
      })
      .replyContentLength();
  }
}

module.exports = TestUtils;
