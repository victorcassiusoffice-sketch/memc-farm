/* MEMC Wild Roots Farmhouse — memc.farm
   No dependencies. Nothing is sent to any server from this page. */
(function () {
  'use strict';

  var PHONE_E164 = '+9779855016826';
  var PHONE_DISPLAY = '+977 985-5016826';
  var WA_NUMBER = '9779855016826';
  var LAT = 27.6046826, LNG = 84.479128;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- owner checklist view: memc.farm/?todo=1 ---------- */
  if (/[?&]todo(=|&|$)/.test(window.location.search)) document.body.classList.add('show-todo');

  /* ---------- header ---------- */
  var hdr = $('#hdr');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal ---------- */
  var rises = $$('[data-rise]');
  if (!window.IntersectionObserver || reduce) {
    rises.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rises.forEach(function (el) { io.observe(el); });
  }

  /* ==========================================================
     HORIZONTAL RAILS
     ========================================================== */
  $$('[data-rail]').forEach(function (rail) {
    var track = $('.rail__track', rail);
    if (!track) return;
    var prev = $('[data-rail-prev]', rail);
    var next = $('[data-rail-next]', rail);
    var bar = $('[data-rail-bar]', rail);

    function step() {
      var first = track.firstElementChild;
      var w = first ? first.getBoundingClientRect().width : 280;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '16') || 16;
      return Math.max(160, w + gap);
    }
    function maxScroll() { return Math.max(0, track.scrollWidth - track.clientWidth); }

    function sync() {
      var max = maxScroll();
      var x = track.scrollLeft;
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= max - 2;
      if (bar) {
        var visible = max > 0 ? track.clientWidth / track.scrollWidth : 1;
        var pos = max > 0 ? x / max : 0;
        bar.style.width = Math.max(12, visible * 100) + '%';
        bar.style.transform = 'translateX(' + (pos * (100 / Math.max(visible, 0.0001) - 100)) + '%)';
      }
    }

    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    // let a vertical-ish wheel drive the rail horizontally on desktop
    track.addEventListener('wheel', function (ev) {
      if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;
      var max = maxScroll();
      if (max <= 0) return;
      var atStart = track.scrollLeft <= 0, atEnd = track.scrollLeft >= max - 1;
      if ((ev.deltaY < 0 && atStart) || (ev.deltaY > 0 && atEnd)) return; // let the page take over
      ev.preventDefault();
      track.scrollLeft += ev.deltaY;
    }, { passive: false });

    sync();
    if (window.ResizeObserver) new ResizeObserver(sync).observe(track);
  });

  /* ==========================================================
     LIGHTBOX
     ========================================================== */
  (function () {
    var triggers = $$('[data-lb]');
    if (!triggers.length) return;

    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML =
      '<div class="lb__stage">' +
        '<button class="lb__prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5 8 12l7 7"/></svg></button>' +
        '<img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">' +
        '<button class="lb__next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg></button>' +
      '</div>' +
      '<div><p class="lb__cap"></p><p class="lb__count"></p></div>' +
      '<button class="lb__x" type="button" aria-label="Close viewer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    document.body.appendChild(lb);

    var img = $('img', lb), cap = $('.lb__cap', lb), count = $('.lb__count', lb);
    var i = 0, lastFocus = null;

    function itemAt(n) {
      var t = triggers[n];
      var full = t.getAttribute('data-lb-src') || (t.querySelector('img') || {}).src;
      var alt = t.getAttribute('data-lb-alt') || (t.querySelector('img') || {}).alt || '';
      var label = t.getAttribute('data-lb-cap') || '';
      return { src: full, alt: alt, cap: label };
    }
    function show(n) {
      i = (n + triggers.length) % triggers.length;
      var it = itemAt(i);
      img.src = it.src; img.alt = it.alt;
      cap.innerHTML = it.cap ? it.cap : '';
      count.textContent = (i + 1) + ' / ' + triggers.length;
    }
    function open(n) {
      lastFocus = document.activeElement;
      show(n);
      lb.classList.add('on');
      document.body.classList.add('lb-open');
      $('.lb__x', lb).focus();
    }
    function close() {
      lb.classList.remove('on');
      document.body.classList.remove('lb-open');
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach(function (t, n) {
      t.addEventListener('click', function (ev) { ev.preventDefault(); open(n); });
    });
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__prev', lb).addEventListener('click', function () { show(i - 1); });
    $('.lb__next', lb).addEventListener('click', function () { show(i + 1); });
    lb.addEventListener('click', function (ev) { if (ev.target === lb || ev.target.classList.contains('lb__stage')) close(); });
    document.addEventListener('keydown', function (ev) {
      if (!lb.classList.contains('on')) return;
      if (ev.key === 'Escape') close();
      else if (ev.key === 'ArrowLeft') show(i - 1);
      else if (ev.key === 'ArrowRight') show(i + 1);
    });
    // swipe
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(dx > 0 ? i - 1 : i + 1);
      x0 = null;
    }, { passive: true });
  })();

  /* ==========================================================
     BOOKING — a structured request, sent on the channel that
     actually closes bookings here. Nothing is stored server-side.
     ========================================================== */
  (function () {
    var bk = $('#bk');
    if (!bk) return;

    var KINDS = {
      table:   'Table for a meal',
      bbq:     'Barbecue evening',
      camp:    'Camping & bonfire',
      group:   'Group booking',
      event:   'Function or event',
      riders:  'Riding group stop'
    };

    var state = { kind: '', date: '', when: '', people: '', name: '', phone: '', notes: '' };
    var step = 1, LAST = 4;
    var KEY = 'memc.booking.v1';

    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved && typeof saved === 'object') Object.keys(state).forEach(function (k) { if (saved[k]) state[k] = saved[k]; });
    } catch (e) {}
    function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

    var panes = $$('[data-bk-pane]', bk);
    var dots = $$('[data-bk-dot]', bk);
    var btnBack = $('[data-bk-back]', bk);
    var btnNext = $('[data-bk-next]', bk);
    var stepNo = $('[data-bk-stepno]', bk);
    var sendRow = $('[data-bk-send]', bk);
    var errBox = $('[data-bk-err]', bk);

    // min date = today
    var dateInput = $('#bk-date', bk);
    if (dateInput) {
      var t = new Date();
      dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
    }

    function reference() {
      var d = new Date();
      var ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      var s = '';
      var chars = 'ACDEFGHJKLMNPQRTUVWXY349';
      for (var n = 0; n < 4; n++) s += chars[Math.floor(Math.random() * chars.length)];
      return 'MEMC-' + ymd + '-' + s;
    }
    var ref = reference();

    function prettyDate(v) {
      if (!v) return '';
      var d = new Date(v + 'T00:00:00');
      if (isNaN(d)) return v;
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }

    function render() {
      panes.forEach(function (p) { p.classList.toggle('on', Number(p.getAttribute('data-bk-pane')) === step); });
      dots.forEach(function (d, n) { d.classList.toggle('on', n < step); });
      if (stepNo) stepNo.textContent = 'Step ' + step + ' of ' + LAST;
      if (btnBack) btnBack.style.visibility = step === 1 ? 'hidden' : 'visible';
      if (btnNext) btnNext.hidden = step === LAST;
      if (sendRow) sendRow.hidden = step !== LAST;
      if (errBox) errBox.textContent = '';
      if (step === LAST) fillSummary();
    }

    function fillSummary() {
      var set = function (k, v) { var el = $('[data-sum="' + k + '"]', bk); if (el) el.textContent = v || '—'; };
      set('kind', KINDS[state.kind] || '—');
      set('date', prettyDate(state.date) || 'To confirm');
      set('when', state.when || 'To confirm');
      set('people', state.people ? state.people + ' people' : '—');
      set('name', state.name);
      set('phone', state.phone);
      set('notes', state.notes || '—');
      var r = $('[data-sum="ref"]', bk); if (r) r.textContent = ref;
    }

    function message() {
      var L = [];
      L.push('Namaste! Booking request from memc.farm');
      L.push('Ref ' + ref);
      L.push('');
      L.push('What: ' + (KINDS[state.kind] || 'Not specified'));
      if (state.date) L.push('Date: ' + prettyDate(state.date));
      if (state.when) L.push('Time: ' + state.when);
      if (state.people) L.push('People: ' + state.people);
      L.push('Name: ' + state.name);
      L.push('Phone: ' + state.phone);
      if (state.notes) { L.push(''); L.push(state.notes); }
      L.push('');
      L.push('Please confirm if you can take us.');
      return L.join('\n');
    }

    function validate() {
      if (step === 1 && !state.kind) return 'Pick what kind of visit it is.';
      if (step === 2) {
        if (!state.date) return 'Choose a date.';
        if (!state.people) return 'How many people are coming?';
      }
      if (step === 3) {
        if (!state.name.trim()) return 'We need a name for the booking.';
        if (!/^[0-9+\-\s()]{7,}$/.test(state.phone.trim())) return 'Add a phone number we can reach you on.';
      }
      return '';
    }

    // pickers
    $$('[data-kind]', bk).forEach(function (b) {
      b.addEventListener('click', function () {
        state.kind = b.getAttribute('data-kind');
        $$('[data-kind]', bk).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        persist();
        if (errBox) errBox.textContent = '';
      });
      if (state.kind === b.getAttribute('data-kind')) b.setAttribute('aria-pressed', 'true');
    });
    $$('[data-when]', bk).forEach(function (b) {
      b.addEventListener('click', function () {
        state.when = b.getAttribute('data-when');
        $$('[data-when]', bk).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        persist();
      });
      if (state.when === b.getAttribute('data-when')) b.setAttribute('aria-pressed', 'true');
    });

    [['#bk-date', 'date'], ['#bk-people', 'people'], ['#bk-name', 'name'], ['#bk-phone', 'phone'], ['#bk-notes', 'notes']].forEach(function (pair) {
      var el = $(pair[0], bk);
      if (!el) return;
      if (state[pair[1]]) el.value = state[pair[1]];
      el.addEventListener('input', function () {
        state[pair[1]] = el.value;
        el.parentNode.classList.remove('field--bad');
        persist();
      });
    });

    if (btnNext) btnNext.addEventListener('click', function () {
      var err = validate();
      if (err) {
        if (errBox) errBox.textContent = err;
        var bad = step === 1 ? null : $('.bk__pane.on input:invalid, .bk__pane.on input[value=""]', bk);
        if (bad) bad.parentNode.classList.add('field--bad');
        return;
      }
      step = Math.min(LAST, step + 1);
      render();
      bk.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    });
    if (btnBack) btnBack.addEventListener('click', function () {
      step = Math.max(1, step - 1); render();
    });

    var waBtn = $('[data-bk-wa]', bk);
    if (waBtn) waBtn.addEventListener('click', function () {
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(message()), '_blank', 'noopener');
    });
    var viBtn = $('[data-bk-viber]', bk);
    if (viBtn) viBtn.addEventListener('click', function () {
      window.location.href = 'viber://chat?number=' + encodeURIComponent(PHONE_E164);
      window.setTimeout(function () {
        if (!document.hidden) {
          var n = $('[data-bk-copied]', bk);
          if (n) n.textContent = 'If Viber did not open, add ' + PHONE_DISPLAY + ' in Viber — or just call.';
        }
      }, 1400);
    });
    var cpBtn = $('[data-bk-copy]', bk);
    if (cpBtn) cpBtn.addEventListener('click', function () {
      var txt = message();
      var done = function () {
        var n = $('[data-bk-copied]', bk);
        if (n) { n.textContent = 'Copied. Paste it into any message — or read it out on the phone.'; }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
    var resetBtn = $('[data-bk-reset]', bk);
    if (resetBtn) resetBtn.addEventListener('click', function () {
      Object.keys(state).forEach(function (k) { state[k] = ''; });
      try { localStorage.removeItem(KEY); } catch (e) {}
      $$('input,textarea', bk).forEach(function (el) { el.value = ''; });
      $$('[aria-pressed]', bk).forEach(function (el) { el.setAttribute('aria-pressed', 'false'); });
      ref = reference();
      step = 1; render();
    });

    render();
  })();

  /* ---------- click-to-load map ---------- */
  var mapBtn = $('#map-load');
  if (mapBtn) {
    mapBtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://maps.google.com/maps?q=' + LAT + ',' + LNG + '&z=15&output=embed';
      f.title = 'Map showing MEMC Wild Roots Farmhouse, Manahara Chowk, Chitwan';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      mapBtn.parentNode.appendChild(f);
      mapBtn.remove();
      var key = $('.map__key'); if (key) key.remove();
    });
  }

  /* ---------- Viber fallback on plain links ---------- */
  $$('a[href^="viber:"]').forEach(function (a) {
    a.addEventListener('click', function () {
      window.setTimeout(function () {
        if (document.hidden) return;
        window.location.href = 'tel:' + PHONE_E164;
      }, 1500);
    });
  });

  /* ---------- year ---------- */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
