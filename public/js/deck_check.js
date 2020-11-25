// eslint-disable-next-line no-unused-vars
function checkDeck() {
  const deckInput = $('textarea#deck-input').val();
  const setCode = $('select#set-code').val();
  const deckCheckResults = $('#deck-check-results');

  const deckCheckTextArea = deckCheckResults.children('textarea');

  deckCheckTextArea.val('').change();
  deckCheckResults.hide();

  $.ajax({
    url: '/deck-check',
    type: 'POST',
    data: JSON.stringify({
      deck: deckInput,
      set: setCode,
    }),
    contentType: 'application/json',
  }).done((response) => {
    deckCheckTextArea.val(
      response,
    ).change();
    deckCheckResults.show();
  }).fail((jqXHR, textStatus) => {
    deckCheckTextArea.val(
      'Error retrieving deck check',
    ).change();
    console.error(`Request failed: ${textStatus}`);
  });
}

$(document).ready(() => {
  $('textarea').each(function () {
    const ta = $(this);
    ta.on('input change', function () {
      console.log(this.scrollHeight);
      const height = Math.max.apply(Math, [this.scrollHeight, 100]);
      this.style.height = `${height}px`;
    });

    ta.change();
  });
});
