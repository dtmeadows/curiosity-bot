const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const Curiosity = require('../commands/curiosity');

router.get('/', (req, res) => {
  // ../sample_decks/valid_decks/current_sample_deck_list.txt
  const sampleDeckPath = path.join(__dirname, '..', 'sample_decks', 'valid_decks', 'current_sample_deck_list.txt');

  const sampleDeck = fs.readFileSync(sampleDeckPath, 'utf8');

  Curiosity.getSupportedSetList().then((supportedSetList) => {
    res.render('index', {

      title: 'Curiosity deck check',
      supportedSetList,
      sampleDeck: sampleDeck,
    });
  });
});

router.post('/deck-check', (req, res) => {
  const deckInput = req.body.deck;
  console.log(`deck input: ${deckInput}`);
  const setCode = req.body.set;
  console.log(`set code: ${setCode}`);

  Curiosity.execute(deckInput, setCode).then((deckCheckResults) => {
    console.log(deckCheckResults);
    res.set('Content-Type', 'text/plain');
    res.send(deckCheckResults);
  });
});

module.exports = router;
