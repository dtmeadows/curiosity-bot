// eslint-disable-next-line no-unused-vars
function checkDeck() {
  console.log('deck check');

  const deckInput = $('textarea#deck-input').val();
  const deckCheckResultsTextArea = $('textarea#deck-check-results');

  deckCheckResultsTextArea.val('');
  deckCheckResultsTextArea.hide();

  console.log(deckInput);

  $.ajax({
    url: '/deck-check',
    type: 'POST',
    data: JSON.stringify({
      deck: deckInput,
    }),
    contentType: 'application/json',
  }).done((response) => {
    console.log('sucessfull request');
    console.log(response);
    deckCheckResultsTextArea.val(
      response,
    );
    deckCheckResultsTextArea.show();
  }).fail((jqXHR, textStatus) => {
    alert(`Request failed: ${textStatus}`);
  });
}

$('textarea').on('input change start', function () {
  this.style.height = '';
  this.style.height = `${this.scrollHeight}px`;
});
