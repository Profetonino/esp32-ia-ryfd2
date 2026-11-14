// Comportamientos comunes: tests autocorregibles y listas de comprobación.
(function () {
  'use strict';

  // ---- Tests: <div class="quiz" data-id="n0"><div class="q" data-ans="b" data-why="..."> ... radios name=q1 value=a|b|c
  document.querySelectorAll('.quiz').forEach(function (quiz) {
    var btn = quiz.querySelector('button.chk');
    var score = quiz.querySelector('.score');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var qs = quiz.querySelectorAll('.q');
      var ok = 0, answered = 0;
      qs.forEach(function (q) {
        var sel = q.querySelector('input:checked');
        var fb = q.querySelector('.fb');
        q.classList.remove('ok', 'bad');
        if (!fb) { fb = document.createElement('p'); fb.className = 'fb'; q.appendChild(fb); }
        if (!sel) { fb.textContent = 'Sin responder.'; return; }
        answered++;
        if (sel.value === q.dataset.ans) {
          ok++; q.classList.add('ok'); fb.textContent = '✔ Correcto. ' + (q.dataset.why || '');
        } else {
          q.classList.add('bad'); fb.textContent = '✘ Todavía no. ' + (q.dataset.hint || 'Vuelve a leer el apartado y prueba otra vez.');
        }
      });
      if (score) score.textContent = ok + ' de ' + qs.length + (answered < qs.length ? ' (faltan ' + (qs.length - answered) + ' por responder)' : '');
    });
  });

  // ---- Listas de comprobación: se recuerdan solo mientras la página está abierta (sin almacenamiento).
  document.querySelectorAll('.checklist input[type=checkbox]').forEach(function (c) {
    c.addEventListener('change', function () {
      var ul = c.closest('.checklist');
      var all = ul.querySelectorAll('input[type=checkbox]');
      var done = ul.querySelectorAll('input[type=checkbox]:checked').length;
      var out = ul.parentNode.querySelector('.cl-count');
      if (out) out.textContent = done + ' de ' + all.length + ' comprobaciones hechas';
    });
  });

  // ---- Menú de apartados: cada página se divide en pestañas, para no tener que desplazarse sin fin.
  document.querySelectorAll('section.page').forEach(function (page) {
    var kids = Array.prototype.slice.call(page.children);
    var cards = kids.filter(function (el) { return el.classList.contains('card') || el.classList.contains('alerta'); });
    if (cards.length < 3) return;
    var first = cards[0];
    var pre = kids.filter(function (el) { return el.classList.contains('note') && kids.indexOf(el) < kids.indexOf(first); });
    var anchor = null;
    kids.forEach(function (el) { if (el.classList.contains('lead') || el.classList.contains('row')) anchor = el; });
    var bar = document.createElement('div');
    bar.className = 'tabs';
    bar.setAttribute('role', 'tablist');
    var btns = [];
    function show(n) {
      cards.forEach(function (c, i) { c.classList.toggle('off', i !== n); });
      pre.forEach(function (c) { c.classList.toggle('off', n !== 0); });
      btns.forEach(function (b, i) { b.classList.toggle('on', i === n); b.setAttribute('aria-selected', i === n ? 'true' : 'false'); });
      var top = bar.getBoundingClientRect().top + window.pageYOffset - 70;
      if (window.pageYOffset > top) window.scrollTo(0, top);
    }
    cards.forEach(function (c, i) {
      var h = c.querySelector('.sec-title') || c.querySelector('h3');
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'tab'; b.setAttribute('role', 'tab');
      b.textContent = h ? h.textContent.replace(/\s+/g, ' ').trim() : 'Apartado ' + (i + 1);
      b.addEventListener('click', function () { show(i); });
      bar.appendChild(b); btns.push(b);
      var nav = document.createElement('p');
      nav.className = 'tabnav';
      if (i > 0) { var p = document.createElement('button'); p.type = 'button'; p.className = 'tabgo'; p.textContent = '‹ Anterior'; p.addEventListener('click', function () { show(i - 1); }); nav.appendChild(p); }
      if (i < cards.length - 1) { var n = document.createElement('button'); n.type = 'button'; n.className = 'tabgo'; n.textContent = 'Siguiente ›'; n.addEventListener('click', function () { show(i + 1); }); nav.appendChild(n); }
      c.appendChild(nav);
    });
    if (anchor && anchor.nextSibling) page.insertBefore(bar, anchor.nextSibling); else page.insertBefore(bar, first);
    show(0);
  });
})();

/* Ampliar imágenes: al pulsar una figura se abre a pantalla completa. Otro clic alterna ajustar/tamaño real. Esc o clic fuera cierra. */
(function () {
  var box = null, img = null, full = false;
  function close() { if (box) { box.remove(); box = null; document.body.style.overflow = ''; } }
  function fit() { full = false; img.className = ''; box.scrollTop = 0; box.scrollLeft = 0; }
  function open(src, alt) {
    close();
    box = document.createElement('div'); box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Imagen ampliada');
    img = document.createElement('img'); img.src = src; img.alt = alt || '';
    var cap = document.createElement('div'); cap.className = 'lb-cap';
    cap.textContent = 'Pulsa la imagen para ver a tamaño real · Esc para cerrar';
    var x = document.createElement('button'); x.type = 'button'; x.className = 'lb-x'; x.textContent = '✕'; x.setAttribute('aria-label', 'Cerrar');
    x.addEventListener('click', close);
    img.addEventListener('click', function (e) { e.stopPropagation(); full = !full; img.className = full ? 'real' : ''; });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.appendChild(img); box.appendChild(x); box.appendChild(cap);
    document.body.appendChild(box); document.body.style.overflow = 'hidden';
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.closest && t.closest('figure.fig')) { open(t.currentSrc || t.src, t.alt); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var s = document.createElement('style');
  s.textContent = 'figure.fig img{cursor:zoom-in}.lb{position:fixed;inset:0;z-index:9999;background:rgba(10,20,25,.92);overflow:auto;display:flex;align-items:flex-start;justify-content:center;padding:44px 12px 40px}.lb img{max-width:100%;max-height:calc(100vh - 90px);width:auto;height:auto;background:#fff;border-radius:8px;cursor:zoom-in;margin:auto}.lb img.real{max-width:none;max-height:none;cursor:zoom-out;margin:0}.lb-x{position:fixed;top:8px;right:12px;width:40px;height:40px;border:0;border-radius:20px;background:#fff;color:#123;font-size:20px;cursor:pointer;z-index:2}.lb-cap{position:fixed;bottom:8px;left:0;right:0;text-align:center;color:#cfe3e8;font-size:.85rem;pointer-events:none}';
  document.head.appendChild(s);
})();
