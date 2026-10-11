/* KI-Kustodiat — Startseite: Farbschema-Umschaltung + kleiner Markdown-Router.
 *
 * Die Startseite UND die Unterseiten liegen als Markdown (content/index.md
 * bzw. content/<slug>.md) und werden zur Laufzeit geladen und gerendert
 * (marked, lokal vendored). Markdown-zu-Markdown-Links (z. B.
 * [Status](status.md)) werden auf Hash-Routen (#/status) umgeschrieben.
 * Auf der Startseite werden reine Link-Absätze zu Pico-Buttons umgebaut
 * (1 Link → primär, mehrere Links → Karten-Raster, Outline).
 */
(function () {
  'use strict';

  /* --- Farbschema ------------------------------------------------------- */
  var THEME_KEY = 'kik-theme';
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var modes = ['auto', 'light', 'dark'];
  var labels = { auto: 'Auto', light: 'Hell', dark: 'Dunkel' };
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var mode = 'auto';
  try { mode = localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { /* ignore */ }
  if (modes.indexOf(mode) < 0) mode = 'auto';

  function resolved(m) { return m === 'auto' ? (mq.matches ? 'dark' : 'light') : m; }
  function applyTheme() {
    root.setAttribute('data-theme', resolved(mode));
    if (btn) btn.textContent = 'Farbschema: ' + labels[mode];
  }
  if (btn) {
    btn.addEventListener('click', function () {
      mode = modes[(modes.indexOf(mode) + 1) % modes.length];
      try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
      applyTheme();
    });
  }
  if (mq.addEventListener) mq.addEventListener('change', applyTheme);
  else if (mq.addListener) mq.addListener(applyTheme);
  applyTheme();

  /* --- Markdown-Unterseiten --------------------------------------------- */
  // Bekannte Routen (#/slug → content/slug.md) mit Seitentitel.
  var PAGES = {
    'openwebui-anleitung': 'Open WebUI — Anleitung',
    'status': 'Status',
    'milestones': 'Milestones',
    'angebote': 'Angebote',
    'faq': 'FAQ'
  };
  var HOME_TITLE = document.title;
  var home = document.getElementById('home');
  var page = document.getElementById('page');
  var content = document.getElementById('page-content');

  function currentSlug() {
    return location.hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  }

  function rewriteLinks(scope) {
    // [x](foo.md) → #/foo
    var links = scope.querySelectorAll('a[href$=".md"]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      var slug = href.replace(/^\.?\/*/, '').replace(/\.md$/, '');
      links[i].setAttribute('href', '#/' + slug);
    }
    // Breite Tabellen horizontal scrollbar machen.
    var tables = scope.querySelectorAll('table');
    for (var j = 0; j < tables.length; j++) {
      var t = tables[j];
      if (t.parentElement && t.parentElement.classList.contains('table-scroll')) continue;
      var wrap = document.createElement('div');
      wrap.className = 'table-scroll';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    }
  }

  // Startseiten-Zutat: Absätze, die nur aus Links bestehen, werden zu
  // Pico-Buttons — genau ein Link → primärer Button, mehrere Links →
  // Karten-Raster mit Outline-Buttons. Damit reicht reines Markdown in
  // content/index.md für die komplette Startseite.
  function isLinksOnly(p) {
    for (var i = 0; i < p.childNodes.length; i++) {
      var n = p.childNodes[i];
      if (n.nodeType === Node.ELEMENT_NODE && n.tagName !== 'A') return false;
      if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) return false;
    }
    return p.querySelector('a') !== null;
  }

  function buttonify(scope) {
    var paras = scope.querySelectorAll('p');
    for (var i = 0; i < paras.length; i++) {
      var p = paras[i];
      if (!isLinksOnly(p)) continue;
      var links = p.querySelectorAll('a');
      if (links.length === 1) {
        links[0].setAttribute('role', 'button');
      } else {
        var grid = document.createElement('div');
        grid.className = 'cards';
        p.parentNode.insertBefore(grid, p);
        while (p.firstChild) grid.appendChild(p.firstChild);
        p.remove();
        for (var k = 0; k < links.length; k++) {
          links[k].setAttribute('role', 'button');
          links[k].classList.add('outline');
        }
      }
    }
  }

  function loadHome() {
    fetch('content/index.md', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (md) {
        home.innerHTML = window.marked.parse(md);
        rewriteLinks(home);
        buttonify(home);
      })
      .catch(function () {
        home.innerHTML =
          '<h1>KI-Kustodiat der Spengergasse</h1>' +
          '<p class="muted">Startseiteninhalt konnte nicht geladen werden. ' +
          'Direktlinks: <a href="https://openwebui.kik.spengergasse.at">Open WebUI Chat</a> · ' +
          '<a href="https://github.com/Die-Spengergasse/KI-Kustodiat/discussions">Diskussion</a>.</p>';
      });
  }

  function showHome() {
    page.hidden = true;
    home.hidden = false;
    document.title = HOME_TITLE;
  }

  function showMessage(title, msg) {
    home.hidden = true;
    page.hidden = false;
    content.innerHTML = '<h1>' + title + '</h1><p>' + msg + '</p>';
    document.title = title + ' — KI-Kustodiat';
    window.scrollTo(0, 0);
  }

  function route() {
    var slug = currentSlug();
    if (!slug) { showHome(); return; }
    if (!Object.prototype.hasOwnProperty.call(PAGES, slug)) {
      showMessage('Seite nicht gefunden', 'Für <code>#/' + slug +
        '</code> gibt es keine Seite. <a href="#/">Zur Startseite</a>.');
      return;
    }
    home.hidden = true;
    page.hidden = false;
    content.innerHTML = '<p class="muted">Lade …</p>';
    document.title = PAGES[slug] + ' — KI-Kustodiat';
    fetch('content/' + slug + '.md', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (md) {
        content.innerHTML = window.marked.parse(md);
        rewriteLinks(content);
        window.scrollTo(0, 0);
      })
      .catch(function () {
        content.innerHTML = '<h1>' + PAGES[slug] +
          '</h1><p class="muted">Inhalt konnte nicht geladen werden. ' +
          'Bitte später erneut versuchen.</p>';
      });
  }

  window.addEventListener('hashchange', route);
  loadHome();
  route();
})();
