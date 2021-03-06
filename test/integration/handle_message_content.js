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
      // these are skipped because we don't dynamically determine the set from discord.
      it.skip('returns error text', async () => {
        const samplePath = path.join(__dirname, '../../sample_decks/valid_decks/sample_deck_list3.txt');
        const rawData = fs.readFileSync(samplePath, 'utf8');

        const expectedErrorText = '❌ This deck does not meet the Curiosity format ❌\n'
          + 'Errors:\n'
          + 'You have too many uncommon cards in your mainboard. You can only have 6 uncommon cards but you have 8 in your mainboard: `Umara Wizard(2)`, `Roost of Drakes(2)`, `Rockslide Sorcerer(2)`, `Merfolk Windrobber(2)`';

        assert.equal(expectedErrorText, await handleMessageContent(`$curiosity ${rawData} `));
      });

      it.skip('handles when command and first card are on first line', async () => {
        skip
        const samplePath = path.join(__dirname, '../../sample_decks/valid_decks/sample_deck_list2.txt');
        const rawData = fs.readFileSync(samplePath, 'utf8');

        const expectedSuccessText = '✅ Deck is valid for Curiosity! ✅';
        assert.equal(expectedSuccessText, await handleMessageContent(`$curiosity ${rawData} `));
      });
    });
  });
});
