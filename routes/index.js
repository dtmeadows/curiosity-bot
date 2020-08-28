const express = require('express');

const router = express.Router();

const Curiosity = require('../commands/curiosity');

router.get('/', (req, res) => {
  res.render('index', {

    title: 'Curiosity deck check',

  });
});

router.post('/deck-check', (req, res) => {
  const deckInput = req.body.deck;
  console.log(deckInput);

  Curiosity.execute(deckInput).then((deckCheckResults) => {
    console.log(deckCheckResults);
    res.set('Content-Type', 'text/plain');
    res.send(deckCheckResults);
  });
});

module.exports = router;
