/* eslint-env mocha */
const assert = require('assert');

const help = require('../../../commands/help.js');

describe('help', () => {
  describe('with no args', () => {
    it('it returns commands list', async () => {
      const expectedMessage = 'Available commands are: `ping, curiosity, help`\nFor help with a specific command, send `$help command`';

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

    it('it provides help on a specific command', async () => {
      const expectedMessage = 'Name: `curiosity`\n'
        + 'Description: `Check deck export from MTG Arena against curiosity rules`\n'
        + 'Usage: `curiosity [deck list]`\n'
        + 'Examples:\n'
        + '\t`curiosity\n'
        + '2 Drowsing Tyrannodon (M21) 178\n'
        + '8 Plains (IKO) 262\n'
        + '2 Pridemalkin(M21) 196`';

      assert.equal(expectedMessage, await help.execute('curiosity'));
    });

    it('it returns an error if no command is found', async () => {
      const expectedMessage = 'Error! Unrecognized command: blur';

      assert.equal(expectedMessage, await help.execute('blur'));
    });
  });
});
