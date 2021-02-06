const Database = require('better-sqlite3');

const db = new Database('./AllPrintings.sqlite');
db.pragma('journal_mode = WAL');

// todo move all this DB stuff into it's own file
const loadCardQuery = db.prepare(`
select 
  name, 
  setCode, 
  number, 
  rarity, 
  types, -- eg Creature, Enchantment, Land, Sorcery, etc
  supertypes -- eg nil, Basic, Legendary 
from usable_cards
where
  setCode = ?
  and number = ?
`);

function loadCard(card) {
  const loadedCard = loadCardQuery.get(card.setCode, card.cardNumber);

  if (loadedCard) {
    // eslint-disable-next-line no-param-reassign
    card.rarity = loadedCard.rarity;
    // eslint-disable-next-line no-param-reassign
    card.types = loadedCard.types;
    // eslint-disable-next-line no-param-reassign
    card.supertypes = loadedCard.supertypes;
    // eslint-disable-next-line no-param-reassign
    card.loaded = true;
  } else {
    card.errors.push(`Unable to find card in database: ${card.cardName} (${card.setCode}) ${card.cardNumber}`);
  }

  return card;
}

const loadSupportedSetListQuery = db.prepare(
  "select name, code from sets where type = 'expansion' and releaseDate >= '2019-01-01' order by releaseDate desc;",
);
// todo: we could memoize this since results should never change while running
function loadSupportedSetList() {
  return loadSupportedSetListQuery.all();
}

function loadCards(parsedMainBoardCards, parsedSideBoardCards) {
  const loadedMainBoardCards = [];
  const loadedSideBoardCards = [];

  parsedMainBoardCards.forEach((card) => {
    loadedMainBoardCards.push(loadCard(card));
  });

  parsedSideBoardCards.forEach((card) => {
    loadedSideBoardCards.push(loadCard(card));
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
      card.loaded = false;
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
    from usable_cards
    where
      setCode = '${approvedSet}'
      and name = '${card.cardName}'
  `;

  // you could argue we should check if other stuff is equivalent
  // in case somehow someone brought a different version of the card in
  let results;
  try {
    results = db.prepare(query).get();
  } catch (e) {
    console.log(e);
    console.log(query);
  }

  return results;
}

function cardIsBasicLand(card) {
  console.log(card);
  return card.types.trim().toLowerCase() === 'land'
    && card.supertypes
    && card.supertypes.trim().toLowerCase() === 'basic';
}

function checkCardsAreFromSet(allCardsInDeck, approvedSet) {
  allCardsInDeck.forEach((card) => {
    if (card.setCode !== approvedSet && !cardIsBasicLand(card)) {
      const cardFromApprovedSet = checkIfSameCardExistsInAllowedSet(card, approvedSet);
      if (cardFromApprovedSet === undefined) {
        card.errors.push(`Only cards from ${approvedSet} are allowed. ${card.cardName} is from ${card.setCode}`);
      } else {
        card.notices.push(`Replaced ${card.cardName} from ${card.setCode} with the same card found in ${approvedSet}`);
        Object.assign(card, cardFromApprovedSet);
      }
    }
  });
}

// This performs two overall checks:
// 1) Does the deck meet the overall rarity requirements? (eg no more than 6 uncommons)
// 2) For each card type, does it exceed the max per card type (eg no more than 2 of each uncommon)
function checkRarity(
  loadedMainBoardCards,
  allCardsInDeck,
  rarities,
  requiredNumForRarity,
  maxNumOfEachCard,
) {
  const errors = [];
  const mainBoardCardsInRarity = loadedMainBoardCards.filter((c) => rarities.includes(c.rarity));
  const allCardsInRarity = allCardsInDeck.filter((c) => rarities.includes(c.rarity));

  const numForRarities = mainBoardCardsInRarity.reduce((sum, c) => sum + Number(c.cardCount), 0);
  const ignoreRequiredNumForRarity = requiredNumForRarity === -1;

  // Check #1
  if (!ignoreRequiredNumForRarity && numForRarities !== requiredNumForRarity) {
    const tooMany = numForRarities > requiredNumForRarity;
    errors.push(
      `You have ${tooMany ? 'too many' : 'too few'} ${rarities.join(' or ')} cards in your mainboard. `
      + `You ${tooMany ? 'can only' : 'must'} have ${requiredNumForRarity} ${rarities.join(' or ')} cards but you have ${numForRarities} in your mainboard: ${mainBoardCardsInRarity.map((c) => `\`${c.cardName}(${c.cardCount})\``).join(', ')}`,
    );
  }

  // Check #2
  // eslint-disable-next-line max-len
  const cardsOverMaxNumOfEachCard = allCardsInRarity.filter((c) => !cardIsBasicLand(c) && c.cardCount > maxNumOfEachCard);

  cardsOverMaxNumOfEachCard.forEach((c) => c.errors.push(
    `You have too many \`${c.cardName}\` cards in your deck. For ${rarities.join(' or ')} cards you can only have ${maxNumOfEachCard} card(s) of the same type but you have ${c.cardCount} in your deck.`,
  ));

  return errors;
}

function readAndParseAndLoadDeck(rawData) {
  const [parsedMainBoardCards, parsedSideBoardCards, parsingErrors] = parsedCardsFromRawLines(rawData.split('\n'));
  console.log(`parsed ${parsedMainBoardCards.length + parsedSideBoardCards.length} cards`);

  const [loadedMainBoardCards, loadedSideBoardCards] = loadCards(
    parsedMainBoardCards,
    parsedSideBoardCards,
  );

  // const allCardsInDeck = loadedMainBoardCards.concat(loadedSideBoardCards);

  const [
    allCardsInDeck,
    cardsNotFoundInDatabase,
  ] = loadedMainBoardCards.concat(loadedSideBoardCards)
    .reduce((result, card) => {
      result[card.loaded ? 0 : 1].push(card);
      return result;
    },
    [[], []]);

  console.log(`loaded ${allCardsInDeck.length} cards`);

  const cardsNotFoundInDatabaseErrors = cardsNotFoundInDatabase.map((c) => c.errors)

  return [
    allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards,
    parsingErrors, cardsNotFoundInDatabaseErrors,
  ];
}

function checkDeck({
  // todo remove default set code after discord bot is fixed
  allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards, setCode = 'ZNR',
}) {
  // const approvedSets = 'ZNR'; TODO: check this here as well
  const minNumberOfMainDeckCards = 40;
  const maxNumberOfSideboardCards = 8;

  const deckErrors = [];
  checkCardsAreFromSet(allCardsInDeck, setCode);

  // at least 40 cards in main deck
  const numberOfMainDeckCards = loadedMainBoardCards
    .reduce((sum, c) => sum + Number(c.cardCount), 0);
  if (numberOfMainDeckCards < minNumberOfMainDeckCards) {
    deckErrors.push(`You have too few cards in your mainboard. The minimum is ${minNumberOfMainDeckCards} but you have ${numberOfMainDeckCards}`);
  }
  // only 2 rares or mythics, one of each
  deckErrors.push(...checkRarity(loadedMainBoardCards, allCardsInDeck, ['rare', 'mythic'], 2, 1));
  // 6 uncommons, 2 of each
  deckErrors.push(...checkRarity(loadedMainBoardCards, allCardsInDeck, ['uncommon'], 6, 2));
  // unlimited commons, 4 max of each
  deckErrors.push(...checkRarity(loadedMainBoardCards, allCardsInDeck, ['common'], -1, 4));
  // 8 card sideboard (no rarity restrictions)
  const numberOfSideboardCards = loadedSideBoardCards
    .reduce((sum, c) => sum + Number(c.cardCount), 0);
  if (numberOfSideboardCards > maxNumberOfSideboardCards) {
    deckErrors.push(`You have too many cards in your sideboard. The max is ${maxNumberOfSideboardCards} but you have ${numberOfSideboardCards}`);
  }

  const allErrors = [];
  if (deckErrors.length > 0) {
    allErrors.push(...deckErrors);
  }

  const erroneousCards = allCardsInDeck.filter((c) => c.errors.length > 0);
  const uniqErroneousCards = [...new Set(erroneousCards.map((c) => c.errors))];

  if (uniqErroneousCards.length > 0) {
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
    + '2 Umara Wizard (ZNR) 86\n'
    + '2 Roost of Drakes (ZNR) 74\n'
    + '2 Rockslide Sorcerer (ZNR) 154',
  ],
  async execute(deckInput, setCode) {
    console.log(`checking deck from set: ${setCode}`);
    const allErrors = [];
    const [
      allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards, 
      parsingErrors, cardsNotFoundInDatabaseErrors,
    ] = readAndParseAndLoadDeck(deckInput);

    allErrors.push(...parsingErrors);
    allErrors.push(...cardsNotFoundInDatabaseErrors);

    // allCardsInDeck, loadedMainBoardCards, loadedSideBoardCards, setCode
    allErrors.push(...checkDeck({
      allCardsInDeck,
      loadedMainBoardCards,
      loadedSideBoardCards,
      setCode,
  }));

    if (allErrors.length > 0) {
      // eslint-disable-next-line prefer-template
      return '❌ This deck does not meet the Curiosity format ❌\n'
        + 'Errors:\n'
        + allErrors.join('\n');
    }
    return '✅ Deck is valid for Curiosity! ✅';
  },
  async getSupportedSetList() { return loadSupportedSetList(); },
};
