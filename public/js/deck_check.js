import autosize from 'autosize';

// eslint-disable-next-line no-unused-vars
function checkDeck() {
  const deckInput = $('textarea#deck-input').val();
  const deckCheckResults = $('#deck-check-results');

  deckCheckResults.children('textarea').val('').change();
  deckCheckResults.hide();

  $.ajax({
    url: '/deck-check',
    type: 'POST',
    data: JSON.stringify({
      deck: deckInput,
    }),
    contentType: 'application/json',
  }).done((response) => {
    deckCheckResults.children('textarea').val(
      response,
    ).change();
    deckCheckResults.show();
  }).fail((jqXHR, textStatus) => {
    console.error(`Request failed: ${textStatus}`);
  });
}

autosize($('textarea'));
