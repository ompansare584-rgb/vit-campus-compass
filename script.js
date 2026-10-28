/* ==========================================================================
   script.js — VIT Campus Compass
   Reads everything from data.js (VCC_DATA) and builds the page.
   Sections: 1 helpers · 2 theme & nav · 3 hero · 4 clubs · 5 events · 6 resources
             7 dialog · 8 Infinity Mode (easter egg) · 9 start-up
   ========================================================================== */
(function () {
  'use strict';

  const D = VCC_DATA;

  /* ---------- 1. Helpers ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Escape text before putting it inside HTML strings (keeps data from ever being treated as markup)
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

  // Lower-case + strip accents so "melange" finds "Mélange"
  const norm = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'");

  const tagLabel = (t) => D.TAG_LABELS[t] || t.replace(/-/g, ' ').replace(/^./, (m) => m.toUpperCase());

  // localStorage can throw (private mode, blocked storage), so every access is wrapped
  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } }
  };

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  }

  /* ---------- Date helpers (event status is computed, never hard-coded) ---------- */
  function parseDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
  function getToday() {
    // ?today=2026-10-29 lets you test how statuses change on another date
    const q = new URLSearchParams(location.search).get('today');
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) return parseDate(q);
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  const TODAY = getToday();
  const DAY = 86400000;

  function eventStatus(ev) {
    if (!ev.startDate) return 'tbc';
    const start = parseDate(ev.startDate);
    const end = parseDate(ev.endDate || ev.startDate);
    if (TODAY < start) return 'upcoming';
    if (TODAY > end) return 'past';
    return 'live';
  }
  const STATUS_LABEL = { upcoming: 'Upcoming', live: 'Happening now', past: 'Past event', tbc: 'Date not confirmed' };

  function formatRange(ev) {
    if (!ev.startDate) return 'Date not confirmed';
    const s = parseDate(ev.startDate), e = parseDate(ev.endDate || ev.startDate);
    const f = (d, o) => d.toLocaleDateString('en-IN', o);
    const full = { day: 'numeric', month: 'long', year: 'numeric' };
    if (+s === +e) return f(s, full);
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${s.getDate()}–${f(e, full)}`;
    return `${f(s, { day: 'numeric', month: 'short' })} – ${f(e, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }
  function countdown(ev) {
    const n = Math.round((parseDate(ev.startDate) - TODAY) / DAY);
    if (n <= 0) return 'Starts today';
    if (n === 1) return 'Starts tomorrow';
    return `Starts in ${n} days`;
  }

  /* ---------- 2. Theme & navigation ---------- */
  const root = document.documentElement;
  function setTheme(theme, save) {
    root.setAttribute('data-theme', theme);
    const btn = $('#themeToggle');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0d0c1b' : '#faf7f2');
    if (save) { try { localStorage.setItem('vcc-theme', theme); } catch (e) { /* ignore */ } }
  }
  $('#themeToggle').addEventListener('click', () => {
    if (!reduceMotion) { root.classList.add('theme-anim'); setTimeout(() => root.classList.remove('theme-anim'), 450); }
    setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  const nav = $('#siteNav'), menuBtn = $('#menuToggle');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu'); }
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menuBtn.focus(); } });

  // Highlight the nav link for the section currently on screen
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const links = $$('[data-spy]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.setAttribute('aria-current', String(a.dataset.spy === en.target.id)));
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    ['clubs', 'events', 'resources'].forEach((id) => io.observe($('#' + id)));
  }

  /* ---------- 3. Hero ---------- */
  const catById = Object.fromEntries(D.CLUB_CATEGORIES.map((c) => [c.id, c]));

  function initHero() {
    // Counts come from the data, so they can never drift out of sync
    const counts = { clubs: D.CLUBS.length, categories: D.CLUB_CATEGORIES.length, events: D.EVENTS.length, resources: D.RESOURCES.length };
    $$('[data-count]').forEach((el) => {
      const target = counts[el.dataset.count];
      if (reduceMotion) { el.textContent = target; return; }
      // quick count-up from 0 (about 0.8s)
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / 800, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    // Decorative orbit: three rings carrying category icons
    const nodes = [
      ['r1', 0, 'tech', ''], ['r1', 120, 'engineering', ''], ['r1', 240, 'growth', ''],
      ['r2', 60, 'media', 'rev'], ['r2', 210, 'business', 'rev'],
      ['r3', 100, 'science', '']
    ];
    const rings = { r1: '', r2: '', r3: '' };
    nodes.forEach(([ring, angle, cat]) => {
      rings[ring] += `<div class="slot" style="--a:${angle}deg"><span class="node" style="--c:var(--c-${cat})">${icon(catById[cat].icon)}</span></div>`;
    });
    $('#orbit').innerHTML =
      `<div class="ring r1">${rings.r1}</div><div class="ring r2 rev">${rings.r2}</div><div class="ring r3">${rings.r3}</div>` +
      `<div class="core">${icon('compass')}</div>`;

    // "Start with what you like" quick picks -> jump into the clubs section pre-filtered
    $('#quickChips').innerHTML = D.CLUB_CATEGORIES.map((c) =>
      `<button type="button" class="chip" style="--c:var(--c-${c.id})" data-preset="${c.id}">${icon(c.icon)}${esc(c.label)}</button>`).join('');
    $('#quickChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-preset]');
      if (!b) return;
      clubState.q = ''; clubState.tag = 'all'; clubState.saved = false; clubState.cat = b.dataset.preset;
      $('#clubSearch').value = '';
      renderClubs();
      $('#clubs').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    // Footer source links
    $('#footLinks').innerHTML = Object.values(D.SOURCES).map((s) =>
      `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join('');
  }

  /* ---------- 4. Campus Clubs ---------- */
  const savedSet = new Set(store.get('vcc-saved', []));
  const clubState = { q: '', cat: 'all', tag: 'all', sort: 'default', saved: false };
  const clubIndex = new Map(); // id -> { club, hay (searchable text), order }

  D.CLUBS.forEach((c, i) => {
    const hay = norm([
      c.name, c.fullName || '', c.description, c.kind || '', catById[c.category].label,
      ...c.tags, ...c.tags.map((t) => t.replace(/-/g, ' ')), ...c.tags.map(tagLabel),
      ...c.sources.map((s) => D.SOURCES[s].label)
    ].join(' '));
    clubIndex.set(c.id, { club: c, hay, order: i });
  });

  function buildClubControls() {
    // Category chips with counts
    const counts = {};
    D.CLUBS.forEach((c) => { counts[c.category] = (counts[c.category] || 0) + 1; });
    $('#clubChips').innerHTML =
      `<button type="button" class="chip" data-cat="all" aria-pressed="true">All <span class="n">${D.CLUBS.length}</span></button>` +
      D.CLUB_CATEGORIES.map((c) =>
        `<button type="button" class="chip" style="--c:var(--c-${c.id})" data-cat="${c.id}" aria-pressed="false">${icon(c.icon)}${esc(c.label)} <span class="n">${counts[c.id] || 0}</span></button>`).join('');

    // Interest dropdown built from the tags that actually exist in the data
    const tags = [...new Set(D.CLUBS.flatMap((c) => c.tags))].sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)));
    $('#clubTag').innerHTML = `<option value="all">All interests</option>` + tags.map((t) => `<option value="${esc(t)}">${esc(tagLabel(t))}</option>`).join('');

    $('#clubChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]'); if (!b) return;
      clubState.cat = b.dataset.cat; renderClubs();
    });
    $('#clubSearch').addEventListener('input', (e) => { clubState.q = e.target.value; renderClubs(); });
    $('#clubTag').addEventListener('change', (e) => { clubState.tag = e.target.value; renderClubs(); });
    $('#clubSort').addEventListener('change', (e) => { clubState.sort = e.target.value; renderClubs(); });
    $('#savedToggle').addEventListener('click', () => { clubState.saved = !clubState.saved; renderClubs(); });
    $('#clubReset').addEventListener('click', resetClubs);

    // One listener handles every card (event delegation)
    $('#clubGrid').addEventListener('click', (e) => {
      const open = e.target.closest('[data-club-open]');
      if (open) openClub(open.dataset.clubOpen, open);
    });
    $('#clubGrid').addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) resetClubs(); });

    const listed = (key) => D.CLUBS.filter((c) => c.sources.includes(key)).length;
    const overlap = D.CLUBS.filter((c) => c.sources.length > 1).length;
    $('#clubNote').textContent =
      `${D.CLUBS.length} clubs, committees and teams from two official VIT pages: Co-curricular Activities (${listed('cocurricular')}) and Technical Clubs (${listed('technical')}). ` +
      `${overlap === 1 ? 'One name appears on both pages and is shown once.' : overlap + ' names appear on both pages and are shown once.'} ` +
      `This is not a complete directory of every club at VIT Pune. Official club links, recruitment dates and contact details were not supplied, so none are shown.`;
  }

  function resetClubs() {
    Object.assign(clubState, { q: '', cat: 'all', tag: 'all', sort: 'default', saved: false });
    $('#clubSearch').value = ''; $('#clubTag').value = 'all'; $('#clubSort').value = 'default';
    renderClubs();
  }

  function filteredClubs() {
    const tokens = norm(clubState.q).split(/\s+/).filter(Boolean);
    let list = D.CLUBS.filter((c) => {
      if (clubState.cat !== 'all' && c.category !== clubState.cat) return false;
      if (clubState.tag !== 'all' && !c.tags.includes(clubState.tag)) return false;
      if (clubState.saved && !savedSet.has(c.id)) return false;
      const hay = clubIndex.get(c.id).hay;
      return tokens.every((t) => hay.includes(t));
    });
    const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base', numeric: true });
    const catOrder = (c) => D.CLUB_CATEGORIES.findIndex((x) => x.id === c.category);
    if (clubState.sort === 'az') list.sort(byName);
    else if (clubState.sort === 'za') list.sort((a, b) => byName(b, a));
    else if (clubState.sort === 'cat') list.sort((a, b) => catOrder(a) - catOrder(b) || byName(a, b));
    return list;
  }

  function clubCard(c, i) {
    const cat = catById[c.category];
    const tags = c.tags.slice(0, 3).map((t) => `<span class="tag">#${esc(tagLabel(t))}</span>`).join('');
    const both = c.sources.length > 1 ? `<span class="badge">Listed on ${c.sources.length} official pages</span>` : '';
    const warn = c.unverified ? `<span class="badge badge-warn">Focus to be verified</span>` : '';
    return `<article class="card club-card reveal" style="--c:var(--c-${c.category});--i:${Math.min(i, 12)}">
      <div class="club-top">
        <span class="tile">${icon(c.icon)}</span>
        <button type="button" class="bm" data-bookmark="${esc(c.id)}" aria-pressed="${savedSet.has(c.id)}" aria-label="Save ${esc(c.name)}">${icon('bookmark')}</button>
      </div>
      <p class="chip-cat"><span class="dot"></span>${esc(cat.label)}</p>
      <h3 class="card-title"><button type="button" class="stretch" data-club-open="${esc(c.id)}" data-trigger="club-${esc(c.id)}">${esc(c.name)}</button></h3>
      <p class="card-desc">${esc(c.description)}</p>
      <div class="card-foot">${warn}${both}${tags}</div>
    </article>`;
  }

  function renderClubs() {
    const list = filteredClubs();
    const total = D.CLUBS.length;
    const grid = $('#clubGrid');

    // chips + controls reflect state
    $$('#clubChips .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === clubState.cat)));
    $('#savedToggle').setAttribute('aria-pressed', String(clubState.saved));
    $('#savedCount').textContent = savedSet.size;

    if (list.length) {
      grid.innerHTML = list.map(clubCard).join('');
    } else {
      const noSaved = clubState.saved && savedSet.size === 0 && !clubState.q && clubState.cat === 'all' && clubState.tag === 'all';
      grid.innerHTML = `<div class="empty">${icon(noSaved ? 'bookmark' : 'empty')}
        <h3>${noSaved ? 'Nothing saved yet' : 'No clubs match that'}</h3>
        <p>${noSaved ? 'Tap the bookmark icon on any club card and it will show up here.' :
          (clubState.q ? `We couldn’t find a club for “${esc(clubState.q)}”. Try a broader word like “tech”, “robotics” or “speaking”, or clear your filters.` : 'Try removing a filter to see more clubs.')}</p>
        <button type="button" class="btn btn-secondary" data-reset>Reset filters</button></div>`;
    }

    const active = clubState.q || clubState.cat !== 'all' || clubState.tag !== 'all' || clubState.saved || clubState.sort !== 'default';
    $('#clubReset').hidden = !active;
    $('#clubCount').textContent = list.length === total
      ? `Showing all ${total} clubs and committees`
      : `Showing ${list.length} of ${total} clubs and committees`;
  }

  function toggleSave(id) {
    const club = clubIndex.get(id).club;
    if (savedSet.has(id)) { savedSet.delete(id); toast(`Removed ${club.name} from saved`); }
    else { savedSet.add(id); toast(`Saved ${club.name}`); }
    store.set('vcc-saved', [...savedSet]);
    $('#savedCount').textContent = savedSet.size;
    syncBookmarks(id);
    // If you're viewing only saved clubs and un-save one, refresh the list (unless the dialog is open)
    if (clubState.saved && !$('#modal').open) renderClubs();
  }
  function syncBookmarks(id) {
    const on = savedSet.has(id);
    $$(`[data-bookmark="${CSS.escape(id)}"]`).forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      const label = $('.bm-label', b); if (label) label.textContent = on ? 'Saved' : 'Save this club';
    });
  }

  function clubModalHTML(c) {
    const cat = catById[c.category];
    const sources = c.sources.map((s) => `<li><a href="${esc(D.SOURCES[s].url)}" target="_blank" rel="noopener noreferrer">${esc(D.SOURCES[s].label)} (official VIT page) ${icon('external')}<span class="sr-only"> opens in a new tab</span></a></li>`).join('');
    const tags = c.tags.length ? `<div class="tag-list">${c.tags.map((t) => `<span class="badge">${esc(tagLabel(t))}</span>`).join('')}</div>` : '<span class="muted">None confirmed</span>';
    const saved = savedSet.has(c.id);
    return `<header class="m-head" style="--c:var(--c-${c.category})">
        <span class="tile tile-lg">${icon(c.icon)}</span>
        <div><p class="chip-cat"><span class="dot"></span>${esc(cat.label)}</p>
          <h2 id="modalTitle">${esc(c.name)}</h2>
          ${c.fullName ? `<p class="m-sub">${esc(c.fullName)}</p>` : ''}</div>
      </header>
      <p class="m-desc">${esc(c.description)}</p>
      ${c.note ? `<p class="callout">${icon('info')}<span>${esc(c.note)}</span></p>` : ''}
      <dl class="m-list">
        <div><dt>Type</dt><dd>${esc(c.kind || 'Student body')}</dd></div>
        <div><dt>Listed under</dt><dd><ul>${sources}</ul></dd></div>
        <div><dt>Interests</dt><dd>${tags}</dd></div>
        <div><dt>Official club link</dt><dd class="muted">Official link not provided</dd></div>
      </dl>
      <div class="m-actions">
        <button type="button" class="btn btn-primary" data-bookmark="${esc(c.id)}" aria-pressed="${saved}">
          <span class="bm-icon-wrap">${icon('bookmark')}</span><span class="bm-label">${saved ? 'Saved' : 'Save this club'}</span>
        </button>
        <button type="button" class="btn btn-secondary" data-close>Close</button>
      </div>`;
  }
  function openClub(id, trigger) { openModal(clubModalHTML(clubIndex.get(id).club), trigger); }

  /* ---------- 5. Events ---------- */
  const evState = { q: '', cat: 'all', status: 'all', sort: 'soon' };
  const evCatById = Object.fromEntries(D.EVENT_CATEGORIES.map((c) => [c.id, c]));
  const evById = Object.fromEntries(D.EVENTS.map((e) => [e.id, e]));

  function apexArt(uid) {
    // Original artwork (no third-party characters or logos): a golden ring over a dusk skyline
    return `<svg class="apex-art" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs><linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a2cff"/><stop offset=".6" stop-color="#c2307e"/><stop offset="1" stop-color="#ff8a4c"/></linearGradient></defs>
      <rect width="400" height="150" fill="url(#g${uid})"/>
      <circle cx="285" cy="64" r="44" fill="none" stroke="#ffd45c" stroke-width="3"/>
      <circle cx="285" cy="64" r="30" fill="none" stroke="#ffd45c" stroke-width="1.5" opacity=".6"/>
      <circle cx="285" cy="64" r="6" fill="#ffd45c"/>
      <g fill="#fff" opacity=".85"><circle cx="40" cy="24" r="1.6"/><circle cx="92" cy="50" r="1.2"/><circle cx="150" cy="20" r="1.6"/><circle cx="190" cy="62" r="1"/><circle cx="360" cy="26" r="1.4"/><circle cx="118" cy="82" r="1"/></g>
      <path d="M0 150V112l26-8 18-18 12 10 22-24 14 16 20-8 26 20 30-6 24 12 30-14 28 10 34-10 30 14 26-6 30 12V150z" fill="#0d0820"/>
    </svg>`;
  }

  function buildEventControls() {
    const counts = {};
    D.EVENTS.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
    const used = D.EVENT_CATEGORIES.filter((c) => counts[c.id]);
    $('#eventChips').innerHTML =
      `<button type="button" class="chip" data-cat="all" aria-pressed="true">All <span class="n">${D.EVENTS.length}</span></button>` +
      used.map((c) => `<button type="button" class="chip" style="--c:${c.color}" data-cat="${c.id}" aria-pressed="false">${esc(c.label)} <span class="n">${counts[c.id]}</span></button>`).join('');

    $('#eventChips').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { evState.cat = b.dataset.cat; renderEvents(); } });
    $('#eventSearch').addEventListener('input', (e) => { evState.q = e.target.value; renderEvents(); });
    $('#eventStatus').addEventListener('change', (e) => { evState.status = e.target.value; renderEvents(); });
    $('#eventSort').addEventListener('change', (e) => { evState.sort = e.target.value; renderEvents(); });
    $('#eventReset').addEventListener('click', resetEvents);
    $('#eventGrid').addEventListener('click', (e) => {
      if (e.target.closest('[data-reset]')) return resetEvents();
      const open = e.target.closest('[data-event-open]');
      if (open) openModal(eventModalHTML(evById[open.dataset.eventOpen]), open);
    });

    $('#eventNote').textContent =
      `Statuses are worked out from today’s date (${TODAY.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}). ` +
      `Dates, venues and registration links that were not supplied are shown as “not confirmed” or “not available” rather than guessed.`;
  }
  function resetEvents() {
    Object.assign(evState, { q: '', cat: 'all', status: 'all', sort: 'soon' });
    $('#eventSearch').value = ''; $('#eventStatus').value = 'all'; $('#eventSort').value = 'soon';
    renderEvents();
  }

  function filteredEvents() {
    const tokens = norm(evState.q).split(/\s+/).filter(Boolean);
    const list = D.EVENTS.filter((e) => {
      if (evState.cat !== 'all' && e.category !== evState.cat) return false;
      if (evState.status !== 'all' && eventStatus(e) !== evState.status) return false;
      const hay = norm([e.name, e.description, e.venue || '', e.theme || '', evCatById[e.category].label, STATUS_LABEL[eventStatus(e)]].join(' '));
      return tokens.every((t) => hay.includes(t));
    });
    const t = (e) => (e.startDate ? parseDate(e.startDate).getTime() : null);
    const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    const rank = { live: 0, upcoming: 1, tbc: 2, past: 3 };
    if (evState.sort === 'az') list.sort(byName);
    else if (evState.sort === 'new') list.sort((a, b) => (t(b) ?? -Infinity) - (t(a) ?? -Infinity) || byName(a, b));
    else if (evState.sort === 'old') list.sort((a, b) => (t(a) ?? Infinity) - (t(b) ?? Infinity) || byName(a, b));
    else list.sort((a, b) => {
      const ra = rank[eventStatus(a)], rb = rank[eventStatus(b)];
      if (ra !== rb) return ra - rb;
      const s = eventStatus(a);
      if (s === 'past') return t(b) - t(a);
      if (s === 'tbc') return byName(a, b);
      return t(a) - t(b);
    });
    return list;
  }

  function eventCard(e, i) {
    const st = eventStatus(e), cat = evCatById[e.category];
    const hint = st === 'upcoming' ? `<span class="ev-hint">${countdown(e)}</span>` : '';
    const reported = e.datesAreUserReported ? ' <span class="badge badge-warn" style="--c:var(--c-community)">User-reported</span>' : '';
    return `<article class="card event-card status-${st}${e.infinity ? ' is-infinity' : ''} reveal" style="--c:${cat.color};--i:${Math.min(i, 12)}">
      ${e.infinity ? apexArt('c' + i) + `<button type="button" class="spark spark-sm" data-infinity aria-pressed="${document.body.classList.contains('infinity')}" aria-label="Hidden surprise: toggle Infinity Mode">${icon('infinity')}</button>` : ''}
      <div class="ev-top"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="chip-cat"><span class="dot"></span>${esc(cat.label)}</span></div>
      <h3 class="ev-title"><button type="button" class="stretch" data-event-open="${esc(e.id)}">${esc(e.name)}</button></h3>
      <div class="ev-meta">
        <span>${icon('calendar')}<span>${esc(formatRange(e))}${reported}</span></span>
        ${e.venue ? `<span>${icon('pin')}<span>${esc(e.venue)}</span></span>` : ''}
        ${e.theme ? `<span>${icon('sparkle')}<span>Theme: ${esc(e.theme)}</span></span>` : ''}
      </div>
      <p class="card-desc">${esc(e.description)}</p>
      <div class="card-foot">${hint}<span>${e.registrationUrl ? 'Registration link available' : 'Details not available'}</span></div>
    </article>`;
  }

  function renderEvents() {
    const list = filteredEvents();
    $$('#eventChips .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === evState.cat)));
    $('#eventGrid').innerHTML = list.length ? list.map(eventCard).join('') :
      `<div class="empty">${icon('empty')}<h3>No events match that</h3><p>Try a different status or category, or clear the search.</p><button type="button" class="btn btn-secondary" data-reset>Reset filters</button></div>`;
    $('#eventReset').hidden = !(evState.q || evState.cat !== 'all' || evState.status !== 'all' || evState.sort !== 'soon');
    $('#eventCount').textContent = list.length === D.EVENTS.length ? `Showing all ${D.EVENTS.length} events` : `Showing ${list.length} of ${D.EVENTS.length} events`;
  }

  function eventModalHTML(e) {
    const st = eventStatus(e), cat = evCatById[e.category];
    const unknown = (e.unknown && e.unknown.length) ? `<ul>${e.unknown.map((u) => `<li>${esc(u)}</li>`).join('')}</ul>` : '';
    return `${e.infinity ? apexArt('m') : ''}
      <header class="m-head" style="--c:${cat.color}">
        <div><p class="ev-top" style="margin-bottom:6px"><span class="status status-${st}">${STATUS_LABEL[st]}</span><span class="chip-cat"><span class="dot"></span>${esc(cat.label)}</span></p>
        <h2 id="modalTitle">${esc(e.name)}</h2></div>
      </header>
      <p class="m-desc">${esc(e.description)}</p>
      ${e.datesAreUserReported ? `<p class="callout">${icon('info')}<span>These dates and the theme were passed on by a student and are not independently verified. Please confirm with the Student Council before planning around them.</span></p>` : ''}
      ${e.sourceNote ? `<p class="callout">${icon('info')}<span>${esc(e.sourceNote)}</span></p>` : ''}
      <dl class="m-list">
        <div><dt>Date</dt><dd>${esc(formatRange(e))}${st === 'upcoming' ? ` · <strong>${countdown(e)}</strong>` : ''}${e.datesAreUserReported ? ' (user-reported)' : ''}</dd></div>
        ${e.theme ? `<div><dt>Theme</dt><dd>${esc(e.theme)} (user-reported)</dd></div>` : ''}
        <div><dt>Venue</dt><dd>${e.venue ? esc(e.venue) : '<span class="muted">Venue not provided</span>'}</dd></div>
        <div><dt>Registration</dt><dd>${e.registrationUrl ? `<a href="${esc(e.registrationUrl)}" target="_blank" rel="noopener noreferrer">Register ${icon('external')}</a>` : '<span class="muted">Details not available</span>'}</dd></div>
        ${unknown ? `<div><dt>Not supplied</dt><dd>${unknown}</dd></div>` : ''}
      </dl>
      ${e.infinity ? `<p class="fine muted" style="font-size:.8125rem">Marvel-inspired theme reference only. This site uses original artwork and is not affiliated with the organisers or with Marvel.</p>` : ''}
      <div class="m-actions"><button type="button" class="btn btn-secondary" data-close>Close</button></div>`;
  }

  /* ---------- 6. Student Resources ---------- */
  const resState = { q: '', cat: 'all' };
  const resCatById = Object.fromEntries(D.RESOURCE_CATEGORIES.map((c) => [c.id, c]));

  function buildResourceControls() {
    const counts = {};
    D.RESOURCES.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    const used = D.RESOURCE_CATEGORIES.filter((c) => counts[c.id]);
    $('#resChips').innerHTML =
      `<button type="button" class="chip" data-cat="all" aria-pressed="true">All <span class="n">${D.RESOURCES.length}</span></button>` +
      used.map((c) => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="false">${icon(c.icon)}${esc(c.label)} <span class="n">${counts[c.id]}</span></button>`).join('');
    $('#resChips').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { resState.cat = b.dataset.cat; renderResources(); } });
    $('#resSearch').addEventListener('input', (e) => { resState.q = e.target.value; renderResources(); });
    $('#resReset').addEventListener('click', resetResources);
    $('#resGrid').addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) resetResources(); });
    $('#resNote').textContent = 'Only resources with a supplied official page are listed. Scholarships, academic forms and community-maintained links have not been added yet, and no links have been invented for them.';
  }
  function resetResources() { Object.assign(resState, { q: '', cat: 'all' }); $('#resSearch').value = ''; renderResources(); }

  function resourceCard(r, i) {
    const cat = resCatById[r.category];
    const badge = r.official
      ? `<span class="badge">${icon('shield')} Official VIT page</span>`
      : `<span class="badge badge-warn">${icon('users')} Community-maintained · unofficial</span>`;
    const details = r.highlights && r.highlights.length
      ? `<details><summary>What it covers</summary><ul>${r.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></details>` : '';
    return `<article class="card res-card${r.official ? '' : ' unofficial'} reveal" style="--c:var(--c-chapters);--i:${Math.min(i, 12)}">
      <div class="res-head"><span class="tile">${icon(r.icon)}</span>
        <div><h3>${esc(r.title)}</h3><div class="card-foot" style="padding:0;margin:0">${badge}<span class="chip-cat">${esc(cat.label)}</span></div></div></div>
      <p class="card-desc">${esc(r.description)}</p>
      ${details}
      ${r.caveat ? `<p class="callout">${icon('info')}<span>${esc(r.caveat)}</span></p>` : ''}
      ${r.url ? `<a class="btn btn-secondary" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.linkLabel || 'Open link')} ${icon('external')}<span class="sr-only"> (opens in a new tab)</span></a>` : ''}
    </article>`;
  }

  function renderResources() {
    const tokens = norm(resState.q).split(/\s+/).filter(Boolean);
    const list = D.RESOURCES.filter((r) => {
      if (resState.cat !== 'all' && r.category !== resState.cat) return false;
      const hay = norm([r.title, r.description, ...(r.highlights || []), resCatById[r.category].label, r.official ? 'official' : 'community unofficial'].join(' '));
      return tokens.every((t) => hay.includes(t));
    });
    $$('#resChips .chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === resState.cat)));
    $('#resGrid').innerHTML = list.length ? list.map(resourceCard).join('') :
      `<div class="empty">${icon('empty')}<h3>No resources match that</h3><p>Try a simpler word like “career” or “sports”.</p><button type="button" class="btn btn-secondary" data-reset>Reset filters</button></div>`;
    $('#resReset').hidden = !(resState.q || resState.cat !== 'all');
    $('#resCount').textContent = list.length === D.RESOURCES.length ? `Showing all ${D.RESOURCES.length} resources` : `Showing ${list.length} of ${D.RESOURCES.length} resources`;
  }

  /* ---------- 7. Dialog (native <dialog>) ---------- */
  const modal = $('#modal');
  let lastTrigger = null;

  function openModal(html, trigger) {
    lastTrigger = trigger || document.activeElement;
    $('#modalBody').innerHTML = html;
    root.classList.add('modal-open');
    if (typeof modal.showModal === 'function') modal.showModal(); else modal.setAttribute('open', '');
    modal.scrollTop = 0;
  }
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-close]')) modal.close();   // click on backdrop or a close button
  });
  modal.addEventListener('close', () => {
    root.classList.remove('modal-open');
    // After saving/un-saving inside the dialog, refresh the list and return focus to the card you opened
    if (clubState.saved) renderClubs();
    const t = lastTrigger && document.body.contains(lastTrigger) ? lastTrigger : (lastTrigger && lastTrigger.dataset.trigger ? $(`[data-trigger="${lastTrigger.dataset.trigger}"]`) : null);
    if (t) t.focus();
  });

  // Bookmark buttons (cards and dialog) share one delegated listener
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-bookmark]');
    if (b) toggleSave(b.dataset.bookmark);
  });

  /* ---------- 8. Infinity Mode (easter egg) ----------
     Find it by: clicking the glowing ∞ in the hero orbit, the small ∞ in the footer or on the
     VishwaKarandak card, or typing the word "infinity" anywhere on the page. */
  const MESSAGE = 'Infinity Mode on. Six universes, one campus, and every club is a doorway. ∞';

  function burst(el) {
    if (reduceMotion || !el) return;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    for (let i = 0; i < 20; i++) {
      const s = document.createElement('span');
      const a = (i / 20) * Math.PI * 2, d = 40 + Math.random() * 70;
      s.className = 'burst';
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      s.addEventListener('animationend', () => s.remove());
      document.body.appendChild(s);
    }
  }
  function setInfinity(on, source) {
    document.body.classList.toggle('infinity', on);
    $$('[data-infinity]').forEach((b) => b.setAttribute('aria-pressed', String(on)));
    $('#infinityExit').hidden = !on;
    if (on) { burst(source); toast(MESSAGE); } else { toast('Back to normal. Welcome back to the main timeline.'); }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-infinity]');
    if (b) setInfinity(!document.body.classList.contains('infinity'), b);
  });
  $('#infinityExit').addEventListener('click', () => setInfinity(false));

  let typed = '';
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    typed = (typed + e.key.toLowerCase()).slice(-8);
    if (typed === 'infinity') { typed = ''; setInfinity(!document.body.classList.contains('infinity'), $('.spark')); }
  });

  /* ---------- Finishing touches: scroll progress, back-to-top, card spotlight ---------- */
  function initPolish() {
    const bar = $('#progress'), topBtn = $('#toTop');
    let ticking = false;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      topBtn.hidden = y < 700;
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    // Update the spotlight position (CSS variables) as the mouse moves over a card
    ['#clubGrid', '#resGrid'].forEach((sel) => {
      $(sel).addEventListener('pointermove', (e) => {
        const card = e.target.closest('.card'); if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- 9. Start-up ---------- */
  setTheme(root.getAttribute('data-theme') || 'light', false);
  initHero();
  buildClubControls();  renderClubs();
  buildEventControls(); renderEvents();
  buildResourceControls(); renderResources();
  initScrollSpy();
  initPolish();
})();
