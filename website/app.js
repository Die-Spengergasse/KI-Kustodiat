/* KI-Kustodiat — Startseite: Farbschema-Umschaltung + kleiner Markdown-Router.
 *
 * Die Unterseiten liegen als Markdown unter content/<slug>.md und werden zur
 * Laufzeit geladen und gerendert (marked, lokal vendored). Markdown-zu-Markdown-
 * Links (z. B. [Status](status.md)) werden auf Hash-Routen (#/status) umgeschrieben.
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
    'plan': 'Plan',
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
  route();
})();
