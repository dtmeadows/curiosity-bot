function checkDeck() {
  console.log('deck check');

  const deckInput = $('textarea#deck-input').val();

  console.log(deckInput);

  const data = {
    deck: deckInput,
    otherKey: 'a',
  };

  const request = $.ajax({ url: '/deck-check', type: 'POST', data: JSON.stringify(data) });

  request.done(() => {
    console.log('sucessfull request');
  });

  request.fail((jqXHR, textStatus) => {
    alert(`Request failed: ${textStatus}`);
  });
}
