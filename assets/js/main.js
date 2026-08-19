/* MEMC Wild Roots Farmhouse — memc.farm
   No dependencies. Nothing is sent anywhere from this page. */
(function () {
  'use strict';

  var WA_NUMBER = '9779855016826';           // +977 985-5016826
  var LAT = 27.6046826, LNG = 84.479128;

  /* ---------- owner checklist view: memc.farm/?todo=1 ----------
     Reveals every outstanding owner input in place. Visitors never see these. */
  if (/[?&]todo(=|&|$)/.test(window.location.search)) {
    document.body.classList.add('show-todo');
  }

  /* ---------- header state ---------- */
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle('is-stuck', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var rises = document.querySelectorAll('[data-rise]');
  if (!window.IntersectionObserver || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    rises.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    rises.forEach(function (el) { io.observe(el); });
  }

  /* ---------- click-to-load map (keeps the page light on mobile data) ---------- */
  var mapBtn = document.getElementById('map-load');
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
      var key = document.querySelector('.map__key');
      if (key) key.remove();
    });
  }

  /* ---------- Viber fallback ----------
     viber://chat?number= is widely used but is NOT in Viber's documented deep-link
     set, and some browsers refuse to hand it off. If nothing takes over the page,
     surface the number so the tap is never a dead end. */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="viber:"]'), function (a) {
    a.addEventListener('click', function () {
      var hidden = false;
      var onHide = function () { hidden = true; };
      document.addEventListener('visibilitychange', onHide, { once: true });
      window.setTimeout(function () {
        document.removeEventListener('visibilitychange', onHide);
        if (hidden || document.hidden) return;
        var note = document.getElementById('enq-note');
        if (note) {
          note.textContent = 'If Viber did not open, add +977 985-5016826 in Viber, or just call.';
        } else {
          window.location.href = 'tel:+9779855016826';
        }
      }, 1400);
    });
  });

  /* ---------- enquiry form -> pre-written WhatsApp message ----------
     Deliberately backend-free: Nepali venues close bookings on WhatsApp and
     Viber, not on web forms, and this keeps hosting at zero cost with no
     personal data stored anywhere. Swap in a real endpoint later if wanted. */
  var form = document.getElementById('enq');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (id) {
        var el = document.getElementById(id);
        return el && el.value ? String(el.value).trim() : '';
      };

      var name = v('f-name');
      if (!name) {
        var n = document.getElementById('f-name');
        n.focus();
        n.style.borderColor = '#C8783A';
        return;
      }

      var date = v('f-date');
      if (date) {
        var d = new Date(date + 'T00:00:00');
        if (!isNaN(d)) {
          date = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        }
      }

      var lines = ['Namaste — enquiry from memc.farm', ''];
      lines.push('Name: ' + name);
      lines.push('Visit: ' + (v('f-type') || 'Not specified'));
      if (date) lines.push('Date: ' + date);
      if (v('f-people')) lines.push('People: ' + v('f-people'));
      if (v('f-msg')) lines.push('', v('f-msg'));

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');

      var note = document.getElementById('enq-note');
      if (note) {
        note.textContent = w
          ? 'Opening WhatsApp… if nothing happened, call +977 985-5016826.'
          : 'Pop-up blocked. Call +977 985-5016826 or tap the WhatsApp button below.';
      }
    });
  }

  /* ---------- year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();
})();
