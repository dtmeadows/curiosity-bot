/* eslint-env mocha */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { handleMessageContent } = require('../../handle_message_content.js');

describe('handleMessageContent', () => {
  it('returns nothing unless prefix is passed', async () => {
    assert.equal(undefined, await handleMessageContent('blur'));
  });

  it('returns helpful message if prefix is passed followed by space', async () => {
    assert.equal('Error! Unable to understand command.', await handleMessageContent('$ ping'));
  });

  it('returns helpful message if unrecognized command is passed', async () => {
    assert.equal('Error! Unrecognized command: \'blah\'', await handleMessageContent('$blah'));
  });

  describe('command matching / calling', () => {
    describe('ping', () => {
      it('returns pong', async () => {
        assert.equal('Pong.', await handleMessageContent('$ping'));
      });
    });

    describe('checkDeck', () => {
      it('returns error text', async () => {
        const samplePath = path.join(__dirname, '../../sample_decks/sample_deck_list4.txt');
        const rawData = fs.readFileSync(samplePath, 'utf8');

        const expectedErrorText = 'You have too many uncommon cards in your mainboard. You can only have 2 uncommon cards but you have 8 in your deck: `Teferi\'s Tutelage(2)`, `Pestilent Haze(2)`, `Eliminate(2)`, `Miscast(2)`';

        assert.equal(expectedErrorText, await handleMessageContent(`$curiosity ${rawData} `));
      });
    });
  });
});
