(function () {
  const STORAGE_BOOKINGS = 'padel_demo_bookings';
  const STORAGE_MATCHES = 'padel_demo_matches';
  const STORAGE_VERIFY = 'padel_demo_verify';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let currentUser = null;

  function loadBookings() {
    try {
      const raw = localStorage.getItem(STORAGE_BOOKINGS);
      const parsed = raw ? JSON.parse(raw) : [];
      const keys = new Set(DEMO.seedBookings);
      parsed.forEach((b) => keys.add(b.key));
      return { list: parsed, keys };
    } catch {
      return { list: [], keys: new Set(DEMO.seedBookings) };
    }
  }

  function saveBookings(list) {
    localStorage.setItem(STORAGE_BOOKINGS, JSON.stringify(list));
  }

  function loadMatches() {
    try {
      const raw = localStorage.getItem(STORAGE_MATCHES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveMatches(list) {
    localStorage.setItem(STORAGE_MATCHES, JSON.stringify(list));
  }

  function getVerifyState() {
    try {
      const raw = localStorage.getItem(STORAGE_VERIFY);
      return raw ? JSON.parse(raw) : { status: 'none' };
    } catch {
      return { status: 'none' };
    }
  }

  function setVerifyState(state) {
    localStorage.setItem(STORAGE_VERIFY, JSON.stringify(state));
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  function showLogin() {
    $('.login-screen').classList.remove('hidden');
    $('.app').classList.remove('is-visible');
  }

  function showApp() {
    $('.login-screen').classList.add('hidden');
    $('.app').classList.add('is-visible');
    updateNavForRole();
    renderAll();
    navigate('home');
  }

  function updateNavForRole() {
    const coachDash = $('#nav-coach-dash');
    const isCoach = currentUser.role === 'coach';
    coachDash.classList.toggle('hidden', !isCoach);
    $$('.nav-item[data-player-only]').forEach((el) => {
      el.classList.toggle('hidden', isCoach);
    });
  }

  function navigate(pageId) {
    $$('.page').forEach((p) => p.classList.toggle('is-active', p.dataset.page === pageId));
    $$('.nav-item[data-page]').forEach((btn) =>
      btn.classList.toggle('is-active', btn.dataset.page === pageId)
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderHome() {
    const bookings = loadBookings().list.filter((b) => b.userEmail === currentUser.email);
    const upcoming = bookings.slice(-3).reverse();
    const matchCount = loadMatches().length;

    const cards = $('#home-cards');
    cards.innerHTML = '';

    if (currentUser.role === 'coach') {
      cards.innerHTML = `
        <div class="card"><h3>Sessions this week</h3><p>${DEMO.coachSessions.length} on your calendar.</p><span class="badge badge-muted">Coach</span></div>
        <div class="card"><h3>Active players</h3><p>${DEMO.coachRoster.length} in your roster.</p><span class="badge badge-success">Synced</span></div>
        <div class="card"><h3>Tip</h3><p>Open Coach dashboard for schedules and roster.</p></div>`;
      return;
    }

    cards.innerHTML = `
      <div class="card"><h3>Your level</h3><p>Intermediate — we match you with similar skills.</p><span class="badge badge-muted">Player</span></div>
      <div class="card"><h3>Match requests</h3><p>${matchCount} connection${matchCount === 1 ? '' : 's'} sent from this device.</p><span class="badge badge-pending">Local demo</span></div>
      <div class="card"><h3>Upcoming bookings</h3><p>${upcoming.length ? upcoming.map((b) => `${b.courtName} · ${b.slot}`).join(' · ') : 'Book a court to see slots here.'}</p></div>`;
  }

  function renderMatching() {
    const container = $('#matching-list');
    const requested = new Set(loadMatches());
    container.innerHTML = DEMO.players
      .map((p) => {
        const dots = [1, 2, 3, 4, 5]
          .map((n) => `<span class="skill-dot ${n <= p.level ? 'filled' : ''}"></span>`)
          .join('');
        const done = requested.has(p.id);
        return `
        <div class="player-row">
          <div class="player-info">
            <strong>${escapeHtml(p.name)}</strong>
            <span>${escapeHtml(p.area)} · ${escapeHtml(p.availability)}</span>
            <div class="skill-dots" title="Level ${p.level}/5">${dots}</div>
          </div>
          <button type="button" class="btn btn-primary btn-small" data-match="${p.id}" ${done ? 'disabled style="opacity:0.5"' : ''}>
            ${done ? 'Requested' : 'Connect'}
          </button>
        </div>`;
      })
      .join('');

    container.querySelectorAll('[data-match]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-match');
        const list = loadMatches();
        if (!list.includes(id)) {
          list.push(id);
          saveMatches(list);
          toast('Match request sent');
          renderMatching();
          renderHome();
        }
      });
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderBooking() {
    const wrap = $('#booking-area');
    const { list: myBookings, keys } = loadBookings();

    wrap.innerHTML = DEMO.courts
      .map((court) => {
        const slots = DEMO.timeSlots
          .map((slot) => {
            const key = `${court.id}-${slot}`;
            const mine = myBookings.some((b) => b.key === key && b.userEmail === currentUser.email);
            const taken = keys.has(key) && !mine;
            let cls = 'slot';
            if (taken) cls += ' booked';
            if (mine) cls += ' mine';
            return `<button type="button" class="${cls}" data-book="${key}" data-court="${escapeHtml(
              court.name
            )}" data-slot="${slot}" ${taken ? 'disabled' : ''}>
              ${mine ? 'Your slot' : taken ? 'Taken' : slot}
            </button>`;
          })
          .join('');
        return `<div class="court-block"><h4>${escapeHtml(court.name)}</h4><div class="slots">${slots}</div></div>`;
      })
      .join('');

    wrap.querySelectorAll('.slot:not(.booked):not(.mine)').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-book');
        const courtName = btn.getAttribute('data-court');
        const slot = btn.getAttribute('data-slot');
        const { list, keys } = loadBookings();
        if (keys.has(key)) {
          toast('Slot no longer available');
          renderBooking();
          return;
        }
        list.push({
          key,
          courtName,
          slot,
          userEmail: currentUser.email,
          at: new Date().toISOString(),
        });
        keys.add(key);
        saveBookings(list);
        toast(`Booked ${courtName} at ${slot}`);
        renderBooking();
        renderHome();
      });
    });
  }

  function renderVerification() {
    const state = getVerifyState();
    const statusEl = $('#verify-status');
    const actions = $('#verify-actions');

    let badge = 'badge-muted';
    let text = 'Not started';
    if (state.status === 'pending') {
      badge = 'badge-pending';
      text = 'Under review';
    } else if (state.status === 'verified') {
      badge = 'badge-success';
      text = 'Verified player';
    }

    statusEl.innerHTML = `<span class="badge ${badge}">${text}</span>`;

    if (state.status === 'none') {
      actions.innerHTML = `
        <button type="button" class="btn btn-primary" id="btn-submit-verify">Submit profile for verification</button>
        <p style="font-size:13px;color:var(--text-secondary);margin:8px 0 0;">MVP: simulates ID check — no file upload.</p>`;
      $('#btn-submit-verify').addEventListener('click', () => {
        setVerifyState({ status: 'pending', at: new Date().toISOString() });
        toast('Submitted for review');
        renderVerification();
      });
    } else if (state.status === 'pending') {
      actions.innerHTML = `
        <button type="button" class="btn btn-secondary" id="btn-sim-approve">Simulate admin approval (demo)</button>`;
      $('#btn-sim-approve').addEventListener('click', () => {
        setVerifyState({ status: 'verified', at: new Date().toISOString() });
        toast('You are verified');
        renderVerification();
      });
    } else {
      actions.innerHTML = `<p style="color:var(--text-secondary);font-size:14px;">You're verified. Enjoy priority booking in a future release.</p>`;
    }
  }

  function renderCoach() {
    const tbody = $('#coach-sessions-body');
    tbody.innerHTML = DEMO.coachSessions
      .map(
        (s) => `
      <tr>
        <td>${escapeHtml(s.player)}</td>
        <td>${s.date}</td>
        <td>${s.time}</td>
        <td>${escapeHtml(s.focus)}</td>
      </tr>`
      )
      .join('');

    const roster = $('#coach-roster-body');
    roster.innerHTML = DEMO.coachRoster
      .map(
        (r) => `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.tier)}</td>
        <td>${r.sessions}</td>
      </tr>`
      )
      .join('');
  }

  function renderAll() {
    $('#user-name').textContent = currentUser.displayName;
    $('#user-role').textContent = currentUser.role === 'coach' ? 'Coach' : 'Player';
    $('.user-avatar').textContent = currentUser.displayName.charAt(0).toUpperCase();
    renderHome();
    if (currentUser.role === 'player') {
      renderMatching();
      renderBooking();
      renderVerification();
    }
    renderCoach();
  }

  function login(role) {
    const c = DEMO.credentials[role];
    currentUser = {
      email: c.email,
      displayName: c.displayName,
      role: c.role,
    };
    showApp();
    toast(`Welcome, ${currentUser.displayName}`);
  }

  function wireLogin() {
    $('#login-email').value = DEMO.credentials.player.email;
    $('#login-password').value = DEMO.credentials.player.password;

    $('#btn-login-player').addEventListener('click', (e) => {
      e.preventDefault();
      login('player');
    });
    $('#btn-login-coach').addEventListener('click', (e) => {
      e.preventDefault();
      login('coach');
    });
  }

  function wireNav() {
    $$('.nav-item[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => navigate(btn.dataset.page));
    });
    $('#btn-logout').addEventListener('click', () => {
      currentUser = null;
      showLogin();
      toast('Signed out');
    });
  }

  function init() {
    wireLogin();
    wireNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
