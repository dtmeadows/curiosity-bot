/* eslint-env mocha */
const assert = require('assert');

const fs = require('fs');
const path = require('path');
const checkDeck = require('../../../commands/curiosity.js');

describe('checkDeck', () => {
  function loadAndCheckDeck(validSampleDir, fileName) {
    const filePath = path.join(validSampleDir, fileName);
    const rawData = fs.readFileSync(filePath, 'utf8');

    // look through the decklist to find the most common setCode among them
    // we should pull this out elsewhere so the discord bot can use it
    const cardRegex = /\(([A-Z]+)\)/gi;
    const matches = Array.from(rawData.matchAll(cardRegex)).map(x => x[1])

    const countByMatches = {}
    matches.map(function(currentValue, index) {
      if (countByMatches.hasOwnProperty(currentValue)) {
        countByMatches[currentValue] = countByMatches[currentValue] + 1;
      } else {
        countByMatches[currentValue] = 1
      }
    });

    console.log(countByMatches)
    const maxValue = Math.max(...Object.values(countByMatches))
    const setCode = Object.keys(countByMatches).find(key => countByMatches[key] === maxValue)
    console.log(setCode)

    return checkDeck.execute(rawData, setCode)
  }

  it('checks valid sample decks', () => {
    const validSampleDir = path.join(__dirname, '../../../sample_decks/valid_decks');
    const fileNames = fs.readdirSync(validSampleDir);
    const testResults = fileNames.map(async (fileName) => {
      return loadAndCheckDeck(validSampleDir, fileName);
    });

    return Promise.all(testResults).then(testResults => {
      testResults.map(testResult => {
        // i wish I could get the filename in the error but that messes with promises
        assert.strictEqual(testResult, '✅ Deck is valid for Curiosity! ✅');
      })
    });
  });

  describe('invalid decks', () => {
    const sampleFile = path.join(__dirname, '../../../sample_decks/invalid_decks/invalid_sideboard.txt');
    const baseDeck = fs.readFileSync(sampleFile, 'utf8');

    // TODO: could probably move this into their own fixtures or at least stop repeating so much
    it('returns an error if you have too many of a rarity across your main and sideboard', async () => {
      assert.match(await checkDeck.execute(baseDeck), /You have too many `Legion Angel` cards in your deck. For rare or mythic cards you can only have 1 card\(s\) of the same type but you have 4 in your deck./);
    });
  });

  it('returns an error if a line cannot be parsed', async () => {
    assert.match(await checkDeck.execute('1 Stormwing Entity (M21)'), new RegExp('unmatched line found: `1 Stormwing Entity \\(M21\\)', 's'));
  });

  it('does return an error if a card cannot be found', async () => {
    assert.match(await checkDeck.execute('1 Swamp (BLAHHH) 105'), /Unable to find card in database: Swamp \(BLAHHH\) 105/);
  });

  describe('rarities', () => {
    const sampleFile = path.join(__dirname, '../../../sample_decks/valid_decks/sample_deck_list.txt');
    const baseDeck = fs.readFileSync(sampleFile, 'utf8');

    // TODO: could probably move this into their own fixtures or at least stop repeating so much
    it('return an error if you have too many of a rarity', async () => {
      const modifiedDeck = baseDeck.replace('1 Charix, the Raging Isle (ZNR) 49', '2 Charix, the Raging Isle (ZNR) 49');
      assert.match(await checkDeck.execute(modifiedDeck, 'ZNR'), /You can only have 2 rare or mythic cards but you have 3 in your mainboard/);
    });

    it('return an error if you have too few of a rarity', async () => {
      const modifiedDeck = baseDeck.replace('2 Merfolk Windrobber (ZNR) 70', '1 Merfolk Windrobber (ZNR) 70');
      assert.match(await checkDeck.execute(modifiedDeck, 'ZNR'), /You must have 6 uncommon cards but you have 5 in your mainboard/);
    });

    it('does not return an error if you have >4 of a basic land', async () => {
      const modifiedDeck = baseDeck.replace('16 Island (ANB) 113', '16 Island (ANB) 113');
      assert.equal('✅ Deck is valid for Curiosity! ✅', await checkDeck.execute(modifiedDeck, 'ZNR'));
    });

    it('does return an error if you have >4 of a non-basic land', async () => {
      const modifiedDeck = baseDeck.replace('16 Island (ANB) 113', '8 Blossoming Sands (M21) 243');
      assert.match(await checkDeck.execute(modifiedDeck, 'ZNR'), /You have too many `Blossoming Sands` cards in your deck\. For common cards you can only have 4 card\(s\) of the same type but you have 8 in your deck\./);
    });

    it('does return an error if you violate rarity restrictions across main and side board', async () => {
      const modifiedDeck = baseDeck.replace('16 Island (ANB) 113', '8 Blossoming Sands (M21) 243');
      assert.match(await checkDeck.execute(modifiedDeck, 'ZNR'), /You have too many `Blossoming Sands` cards in your deck\. For common cards you can only have 4 card\(s\) of the same type but you have 8 in your deck\./);
    });
  });
});
