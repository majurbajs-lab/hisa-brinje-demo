/* B&W Križ – predogled: mobilni meni, video ob kliku, obrazec za povpraševanje. Brez knjižnic. */
(function () {
  'use strict';

  /* ---------- mobilni meni ---------- */
  var gumb = document.querySelector('.meni-gumb');
  var meni = document.getElementById('glavni-meni');
  if (gumb && meni) {
    var napis = gumb.querySelector('.meni-besedilo');
    function nastavi(odprt) {
      gumb.setAttribute('aria-expanded', String(odprt));
      meni.classList.toggle('odprt', odprt);
      napis.textContent = odprt ? 'Zapri' : 'Meni';
    }
    gumb.addEventListener('click', function () {
      nastavi(gumb.getAttribute('aria-expanded') !== 'true');
    });
    meni.addEventListener('click', function (e) {
      if (e.target.closest('a')) nastavi(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gumb.getAttribute('aria-expanded') === 'true') {
        nastavi(false);
        gumb.focus();
      }
    });
  }

  /* ---------- video: naloži se šele po kliku ---------- */
  document.querySelectorAll('.video').forEach(function (ovoj) {
    var b = ovoj.querySelector('.video-gumb');
    if (!b) return;
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      // youtube-nocookie.com; predvajanje se začne šele po kliku uporabnika
      f.src = 'https://www.youtube-nocookie.com/embed/' + ovoj.dataset.videoId +
              '?autoplay=1&rel=0&hl=sl';
      f.title = ovoj.dataset.videoTitle;
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.loading = 'lazy';
      b.replaceWith(f);
      f.focus();
    });
  });

  /* ---------- obrazec za povpraševanje ---------- */
  var form = document.getElementById('povprasevanje');
  if (!form) return;
  var stanje = document.getElementById('obrazec-stanje');
  var prihod = form.elements.prihod;
  var odhod = form.elements.odhod;

  function danes() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  function dodajDan(iso) {
    var d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  prihod.min = danes();
  odhod.min = dodajDan(danes());
  prihod.addEventListener('change', function () {
    if (prihod.value) odhod.min = dodajDan(prihod.value);
  });

  /* Mesto za morebitno preverjanje razpoložljivosti v prihodnje. */
  function preveriRazpolozljivost(/* prihod, odhod, soba */) {
    return null; // v predogledu ne preverjamo
  }

  function pokaziNapako(polje, sporocilo) {
    var p = document.getElementById(polje.id + '-napaka');
    polje.setAttribute('aria-invalid', sporocilo ? 'true' : 'false');
    if (!p) return;
    p.textContent = sporocilo || '';
    p.hidden = !sporocilo;
  }

  function preveri() {
    var napake = [];
    var e = form.elements;
    function pravilo(polje, pogoj, sporocilo) {
      var ok = pogoj();
      pokaziNapako(polje, ok ? '' : sporocilo);
      if (!ok) napake.push({ polje: polje, sporocilo: sporocilo });
    }
    pravilo(e.ime, function () { return e.ime.value.trim() !== ''; }, 'Vpišite ime in priimek.');
    pravilo(e.eposta, function () { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.eposta.value.trim()); },
      'Vpišite veljaven e-poštni naslov, na primer ime@primer.si.');
    pravilo(e.prihod, function () { return e.prihod.value !== '' && e.prihod.value >= danes(); },
      e.prihod.value ? 'Datum prihoda ne more biti v preteklosti.' : 'Izberite datum prihoda.');
    pravilo(e.odhod, function () { return e.odhod.value !== '' && (!e.prihod.value || e.odhod.value > e.prihod.value); },
      e.odhod.value ? 'Datum odhoda mora biti po datumu prihoda.' : 'Izberite datum odhoda.');
    pravilo(e.gostje, function () { var n = Number(e.gostje.value); return Number.isInteger(n) && n >= 1; },
      'Vpišite število gostov (vsaj 1).');
    return napake;
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var napake = preveri();
    stanje.classList.toggle('napake', napake.length > 0);
    if (napake.length) {
      stanje.textContent = 'Obrazca ni bilo mogoče oddati: ' + napake.map(function (n) { return n.sporocilo; }).join(' ');
      napake[0].polje.focus();
      return;
    }
    if (form.elements['spletna-stran'].value) return; // robot

    preveriRazpolozljivost(form.elements.prihod.value, form.elements.odhod.value, form.elements.soba.value);

    /* Tukaj se priklopi pošiljanje obrazca, npr. fetch(..., { method: 'POST', body: new FormData(form) }). */
    stanje.textContent = 'To je predogled, obrazec še ne pošilja.';
  });
})();
