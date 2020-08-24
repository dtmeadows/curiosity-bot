/* eslint-env mocha */
const assert = require('assert');

const ping = require('../../../commands/ping.js');

describe('ping', () => {
  it('returns pong', async () => {
    assert.equal('Pong.', await ping.execute('!ping'));
  });
});
