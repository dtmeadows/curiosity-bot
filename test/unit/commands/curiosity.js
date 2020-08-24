/* eslint-env mocha */
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
});
