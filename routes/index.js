const express = require('express');

const router = express.Router();

const Curiosity = require('../commands/curiosity');

router.get('/', (req, res) => {
  // todo: populate set dropdown via query on sets table
  res.render('index', {

    title: 'Curiosity deck check',

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
