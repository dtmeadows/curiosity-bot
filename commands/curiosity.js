const Database = require('better-sqlite3');

const db = new Database('./AllPrintings.sqlite');
db.pragma('journal_mode = WAL');

function loadCards(parsedMainBoardCards, parsedSideBoardCards) {
  const loadedMainBoardCards = [];
  const loadedSideBoardCards = [];

  const loadCardQuery = db.prepare(`
    select name, setCode, number, rarity, types
    from cards
    where
      setCode = ?
      and number = ?
  `);

  parsedMainBoardCards.forEach((card) => {
    const loadedCard = loadCardQuery.get(card.setCode, card.cardNumber);

    if (loadedCard) {
      // eslint-disable-next-line no-param-reassign
      card.rarity = loadedCard.rarity;
      // eslint-disable-next-line no-param-reassign
      card.types = loadedCard.types;
    } else {
      card.errors.push('I could not find that card in the database.');
    }

    loadedMainBoardCards.push(card);
  });

  parsedSideBoardCards.forEach((card) => {
    const loadedCard = loadCardQuery.get(card.setCode, card.cardNumber);

    if (loadedCard) {
      // eslint-disable-next-line no-param-reassign
      card.rarity = loadedCard.rarity;
      // eslint-disable-next-line no-param-reassign
      card.types = loadedCard.types;
    } else {
      card.errors.push('I could not find that card in the database.');
    }

    // eslint-disable-next-line no-param-reassign
    card.rarity = loadedCard.rarity;
    // eslint-disable-next-line no-param-reassign
    card.types = loadedCard.types;
    loadedSideBoardCards.push(card);
  });

  return [loadedMainBoardCards, loadedSideBoardCards];
}

function parsedCardsFromRawLines(rawDataArray) {
  const cardRegex = /^\s*(?<cardCount>\d+)\s+(?<cardName>.*)\s+\((?<setCode>\w+)\)\s+(?<cardNumber>\d+)\s*$/;
  const mainBoardCards = [];
  const sideBoardCards = [];
  const parsingErrors = [];

  let sideBoardFound = false;
  rawDataArray.forEach((rawLine) => {
    const cardExtract = cardRegex.exec(rawLine);
    if (cardExtract) {
      const card = cardExtract.groups;
      card.errors = [];
      card.notices = [];
      if (!sideBoardFound) { mainBoardCards.push(card); } else {
        sideBoardCards.push(card);
      }
    } else if (rawLine.trim().toLowerCase() === 'sideboard') {
      sideBoardFound = true;
    } else if (['', 'deck'].includes(rawLine.trim().toLowerCase())) {
      // ignore empty line
    } else {
      const error = `unmatched line found: \`${rawLine}\``;
      parsingErrors.push(error);
      console.log(error);
    }
  });

  return [mainBoardCards, sideBoardCards, parsingErrors];
}

function checkIfSameCardExistsInAllowedSet(card, approvedSet) {
  const query = `
    select name, setCode, number, rarity, types
    from cards
    where
      setCode = '${approvedSet}'
      and name = '${card.cardName}'
  `;
  // you could argue we should check if other stuff is equivalent
  // in case somehow someone brought a different version of the card in
  return db.prepare(query).get();
}

function checkCardsAreFromSet(allCardsInDeck, approvedSet) {
  allCardsInDeck.forEach((card) => {
    if (card.setCode !== approvedSet && card.types.trim().toLowerCase() !== 'land') {
      const cardFromApprovedSet = checkIfSameCardExistsInAllowedSet(card, approvedSet);
      if (cardFromApprovedSet === undefined) {
        card.errors.push(`Only cards from ${approvedSet} are allowed. ${card.cardName} is from ${card.setCode}`);
        console.log(card);
      } else {
        card.notices.push(`Replaced ${card.cardName} from ${card.setCode} with the same card found in ${approvedSet}`);
        Object.assign(card, cardFromApprovedSet);
      }
    }
  });
}

function checkRarity(allCardsInDeck, rarities, requiredNumForRarity, maxNumOfEachCard) {
  const errors = [];
  const cardsInRarity = allCardsInDeck.filter((c) => rarities.includes(c.rarity));

  const numForRarities = cardsInRarity.reduce((sum, c) => sum + Number(c.cardCount), 0);

  if (numForRarities !== requiredNumForRarity) {
    const tooMany = numForRarities > requiredNumForRarity;
    errors.push(
      `You have ${tooMany ? 'too many' : 'too few'} ${rarities.join(' or ')} cards in your mainboard. `
      + `You ${tooMany ? 'can only' : 'must'} have ${requiredNumForRarity} ${rarities.join(' or ')} cards but you have ${numForRarities} in your deck: ${cardsInRarity.map((c) => `\`${c.cardName}(${c.cardCount})\``).join(', ')}`,
    );
  }

  const cardsOverMaxNumOfEachCard = cardsInRarity.filter((c) => c.cardCount > maxNumOfEachCard);

  cardsOverMaxNumOfEachCard.forEach((c) => c.errors.push(
    `You have too many \`${c.cardName}\` cards in your mainboard. For ${rarities.join(' or ')} cards you can only have ${maxNumOfEachCard} card(s) of the same type but you have ${c.cardCount} in your deck.`,
  ));

  return errors;
}

function readAndParseAndLoadDeck(rawData) {
  // console.log(rawData);
  const [parsedMainBoardCards, parsedSideBoardCards, parsingErrors] = parsedCardsFromRawLines(rawData.split('\n'));
  console.log(`parsed ${parsedMainBoardCards.length + parsedSideBoardCards.length} cards`);

  const [loadedMainBoardCards, loadedSideBoardCards] = loadCards(
    parsedMainBoardCards,
    parsedSideBoardCards,
  );

  const allCardsInDeck = loadedMainBoardCards.concat(loadedSideBoardCards);

  console.log(`loaded ${allCardsInDeck.length} cards`);

  return [
    allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards, parsingErrors,
  ];
}

function checkDeck(allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards) {
  const approvedSet = 'M21';
  const minNumberOfMainDeckCards = 40;
  const maxNumberOfSideboardCards = 8;

  const deckErrors = [];
  checkCardsAreFromSet(allCardsInDeck, approvedSet);

  // at least 40 cards in main deck
  const numberOfMainDeckCards = loadedMainBoardCards
    .reduce((sum, c) => sum + Number(c.cardCount), 0);
  if (numberOfMainDeckCards < minNumberOfMainDeckCards) {
    deckErrors.push(`You have too few cards in your mainboard. The minimum is ${minNumberOfMainDeckCards} but you have ${numberOfMainDeckCards}`);
  }
  // only 2 rares or mythics, one of each
  deckErrors.push(...checkRarity(loadedMainBoardCards, ['rare', 'mythic'], 2, 1));
  // 6 uncommons, 2 of each
  deckErrors.push(...checkRarity(loadedMainBoardCards, ['uncommon'], 6, 2));
  // 8 card sideboard (no rarity restrictions)
  const numberOfSideboardCards = loadedSideBoardCards
    .reduce((sum, c) => sum + Number(c.cardCount), 0);
  if (numberOfSideboardCards > maxNumberOfSideboardCards) {
    deckErrors.push(`You have too many cards in your sideboard. The max is ${maxNumberOfSideboardCards} but you have ${numberOfSideboardCards}`);
  }

  const allErrors = [];
  if (deckErrors.length > 0) {
    console.log(
      `There were errors with your deck:\n${deckErrors.join('\n')}`,
    );
    allErrors.push(...deckErrors);
  }

  const erroneousCards = allCardsInDeck.filter((c) => c.errors.length > 0);
  const uniqErroneousCards = [...new Set(erroneousCards.map((c) => c.errors))];

  if (uniqErroneousCards.length > 0) {
    console.log(
      `There were errors with some cards in your deck:\n${uniqErroneousCards.join('\n')}`,
    );
    allErrors.push(...uniqErroneousCards);
  }

  return allErrors;
}

module.exports = {
  name: 'curiosity',
  description: 'Check deck export from MTG Arena against curiosity rules',
  usage: 'curiosity [deck list]',
  examples: [
    'curiosity\n'
    + '2 Drowsing Tyrannodon (M21) 178\n'
    + '8 Plains (IKO) 262\n'
    + '2 Pridemalkin(M21) 196',
  ],
  async execute(messageContent) {
    console.log('checking deck');
    const allErrors = [];
    const [
      allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards, parsingErrors,
    ] = readAndParseAndLoadDeck(messageContent);

    allErrors.push(...parsingErrors);

    allErrors.push(...checkDeck(allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards));

    if (allErrors.length > 0) {
      // eslint-disable-next-line prefer-template
      return '❌ This deck does not meet the Curiosity format ❌\n'
        + 'Errors:\n'
        + allErrors.join('\n');
    }
    return '✅ Deck is valid for Curiosity! ✅';
  },
};
