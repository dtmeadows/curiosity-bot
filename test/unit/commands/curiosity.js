/* eslint-env mocha */
const assert = require('assert');

const fs = require('fs');
const path = require('path');
const checkDeck = require('../../../commands/curiosity.js');

describe('checkDeck', () => {
  it('checks sample decks', () => {
    const sampleDir = path.join(__dirname, '../../../sample_decks/');
    const fileNames = fs.readdirSync(sampleDir);
    fileNames.forEach(async (fileName) => {
      const filePath = path.join(sampleDir, fileName);
      console.log(`checking ${filePath}`);
      const rawData = fs.readFileSync(filePath, 'utf8');

      checkDeck.execute(rawData);
    });
  });

  it('returns an error if a line cannot be parsed', async () => {
    assert.match(await checkDeck.execute('1 Stormwing Entity (M21)'), new RegExp('unmatched line found: `1 Stormwing Entity \\(M21\\)', 's'));
  });

  describe('rarities', () => {
    const sampleFile = path.join(__dirname, '../../../sample_decks/sample_deck_list.txt');
    const baseDeck = fs.readFileSync(sampleFile, 'utf8');

    it('return an error if you have too many of a rarity', async () => {
      const modifiedDeck = baseDeck.replace('1 Basri Ket (M21) 7', '2 Basri Ket (M21) 7');
      assert.match(await checkDeck.execute(modifiedDeck), /You can only have 2 rare or mythic cards but you have 3 in your deck/);
    });

    it('return an error if you have too few of a rarity', async () => {
      const modifiedDeck = baseDeck.replace('2 Wildwood Scourge (M21) 214', '1 Wildwood Scourge (M21) 214');
      assert.match(await checkDeck.execute(modifiedDeck), /You must have 6 uncommon cards but you have 5 in your deck/);
    });

    it('does not return an error if you have >4 of a basic land', async () => {
      const modifiedDeck = baseDeck.replace('4 Forest (IKO) 274', '8 Forest (IKO) 274');
      assert.equal('✅ Deck is valid for Curiosity! ✅', await checkDeck.execute(modifiedDeck));
    });

    it('does return an error if you have >4 of a non-basic land', async () => {
      const modifiedDeck = baseDeck.replace('4 Blossoming Sands (M20) 243', '8 Blossoming Sands (M20) 243');
      assert.match(await checkDeck.execute(modifiedDeck), /You have too many `Blossoming Sands` cards in your mainboard\. For common cards you can only have 4 card\(s\) of the same type but you have 8 in your deck\./);
    });
  });
});
