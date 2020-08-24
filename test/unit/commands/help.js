/* eslint-env mocha */
const assert = require('assert');

const help = require('../../../commands/help.js');

describe('help', () => {
  describe('with no args', () => {
    it('it returns commands list', async () => {
      const expectedMessage = 'Available commands are: `ping, help`\nFor help with a specific command, send `$help command`';

      assert.equal(expectedMessage, await help.execute());
    });
  });

  describe('with args', () => {
    it('it provides help on a specific command', async () => {
      const expectedMessage = 'Name: `ping`\n'
        + 'Aliases: ``\n'
        + 'Description: `Ping!`';

      assert.equal(expectedMessage, await help.execute('ping'));
    });

    it('it returns an error if no command is found', async () => {
      const expectedMessage = 'Error! Unrecognized command: blur';

      assert.equal(expectedMessage, await help.execute('blur'));
    });
  });
});
