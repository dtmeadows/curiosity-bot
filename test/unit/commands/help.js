/* eslint-env mocha */
const assert = require('assert');

const help = require('../../../commands/help.js');

describe('help', () => {
  describe('with no args', () => {
    it('it returns commands list', async () => {
      const expectedMessage = 'Available commands are: `++, --, ==, ping, help, stats`\nFor help with a specific command, send `!help command`';

      assert.equal(expectedMessage, await help.execute());
    });
  });

  describe('with args', () => {
    it('it provides help on a specific command', async () => {
      const expectedMessage = 'Name: `++`\n'
        + 'Aliases: `upvote`\n'
        + 'Description: `Add 1 point to something`\n'
        + 'Usage: `++ [recipient] [optional reason]`\n'
        + 'Examples:\n'
        + '\t`++ carrots`\n'
        + '\t`++ carrots for being so crunchy`';

      assert.equal(expectedMessage, await help.execute('++'));
    });

    it('it returns an error if no command is found', async () => {
      const expectedMessage = 'Error! Unrecognized command: blur';

      assert.equal(expectedMessage, await help.execute('blur'));
    });
  });
});
