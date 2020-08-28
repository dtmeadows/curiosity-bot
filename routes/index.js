const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {

    title: 'Curiosity deck check',

  });
});

router.post('/deck-check', (req, res) => {
  console.log(`body: ${JSON.stringify(req.body)}`);
  res.send('heard from /deck-deck');
});

module.exports = router;
