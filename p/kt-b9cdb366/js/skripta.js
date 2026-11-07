/* Kamp Tura / KPLG Group – osnutek v1 */
(function () {
  'use strict';

  // Meni za telefon
  var gumb = document.querySelector('.meni-gumb');
  var meni = document.getElementById('glavni-meni');
  if (gumb && meni) {
    var zapri = function () {
      gumb.setAttribute('aria-expanded', 'false');
      meni.classList.remove('odprt');
    };
    gumb.addEventListener('click', function () {
      var odprt = gumb.getAttribute('aria-expanded') === 'true';
      gumb.setAttribute('aria-expanded', String(!odprt));
      meni.classList.toggle('odprt', !odprt);
      if (!odprt) {
        var prva = meni.querySelector('a');
        if (prva) prva.focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gumb.getAttribute('aria-expanded') === 'true') {
        zapri();
        gumb.focus();
      }
    });
    meni.addEventListener('click', function (e) {
      if (e.target.closest('a') && window.matchMedia('(max-width: 1179px)').matches) zapri();
    });
  }

  // Obrazci v osnutku ne pošiljajo
  document.querySelectorAll('form[data-osnutek]').forEach(function (obrazec) {
    obrazec.addEventListener('submit', function (e) {
      e.preventDefault();
      var izpis = obrazec.querySelector('.sporocilo-obrazca');
      if (izpis) {
        izpis.hidden = false;
        izpis.textContent = 'To je osnutek, obrazec še ne pošilja.';
        izpis.focus();
      }
    });
  });
})();
