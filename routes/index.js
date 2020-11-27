const express = require('express');

const router = express.Router();

const Curiosity = require('../commands/curiosity');

router.get('/', (req, res) => {
  Curiosity.getSupportedSetList().then((supportedSetList) => {
    res.render('index', {

      title: 'Curiosity deck check',
      supportedSetList,

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
