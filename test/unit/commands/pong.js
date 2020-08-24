/* eslint-env mocha */
const assert = require('assert');

const pong = require('../../../commands/pong');

describe('pong', () => {
  it('returns the right thing', async () => {
    assert.equal('Ping pong buddy', await pong.execute('abc123'));
  });
});
