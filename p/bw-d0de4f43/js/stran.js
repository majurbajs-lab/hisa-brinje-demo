/* B&W Križ – predogled: mobilni meni, izbran razdelek, drsniki fotografij, video ob kliku, obrazec za povpraševanje. Brez knjižnic. */
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

  /* ---------- izbran razdelek v meniju (zelena) ---------- */
  var povezave = Array.prototype.slice.call(document.querySelectorAll('.meni a[href^="#"]'));
  var razdelki = povezave.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  function oznaciAktivno(i) {
    povezave.forEach(function (a, j) {
      if (j === i) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  var cakam = false;
  function posodobiAktivno() {
    cakam = false;
    var glava = document.querySelector('.glava');
    var meja = (glava ? glava.getBoundingClientRect().bottom : 0) + 40;
    var izbran = 0;
    razdelki.forEach(function (r, i) {
      if (r && r.getBoundingClientRect().top <= meja) izbran = i;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) izbran = razdelki.length - 1;
    oznaciAktivno(izbran);
  }
  if (povezave.length) {
    window.addEventListener('scroll', function () {
      if (!cakam) { cakam = true; window.requestAnimationFrame(posodobiAktivno); }
    }, { passive: true });
    window.addEventListener('resize', posodobiAktivno);
    posodobiAktivno();
  }

  /* ---------- drsniki fotografij: gumba, tipke ←/→, podrsanje; brez samodejnega predvajanja ---------- */
  document.querySelectorAll('.drsnik').forEach(function (d) {
    var slike = Array.prototype.slice.call(d.querySelectorAll('.drsnik-slika'));
    var stevec = d.querySelector('.drsnik-trenutna');
    var trak = d.querySelector('.drsnik-trak');
    var i = 0;
    function pokazi(n) {
      i = (n + slike.length) % slike.length;
      slike.forEach(function (s, j) { s.hidden = j !== i; });
      if (stevec) stevec.textContent = String(i + 1);
    }
    d.querySelector('.drsnik-nazaj').addEventListener('click', function () { pokazi(i - 1); });
    d.querySelector('.drsnik-naprej').addEventListener('click', function () { pokazi(i + 1); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { pokazi(i - 1); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { pokazi(i + 1); e.preventDefault(); }
    });
    var x0 = null, y0 = null;
    trak.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    trak.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) pokazi(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
    pokazi(0);
  });

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
