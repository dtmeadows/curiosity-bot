/* eslint-env mocha */
const fs = require('fs');
const path = require('path');
const checkDeck = require('../../../commands/check_deck.js');

describe('checkDeck', () => {
  it('checks sample decks', async () => {
    const sampleDir = path.join(__dirname, '../../sample_decks/');
    const fileNames = fs.readdirSync(sampleDir);
    fileNames.forEach((fileName) => {
      const filePath = path.join(sampleDir, fileName);
      console.log(`checking ${filePath}`);
      const rawData = fs.readFileSync(filePath, 'utf8');

      checkDeck.execute(rawData);
    });
  });
});
