(() => {
  const app = document.getElementById('app');
  const api = async (path, options = {}) => {
    const response = await fetch(`/api/${path}`, { ...options, headers: { 'content-type': 'application/json', ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  };
  const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);

  function showLogin() {
    app.innerHTML = `<section class="login"><h1 class="brand">Broad Concept Hub</h1><h2>Staff Request Portal</h2><p class="muted">Sign in with your staff account.</p><form id="login-form"><label>Username<input id="login-username" required autocomplete="username"></label><label>Password<input id="login-password" type="password" required autocomplete="current-password"></label><p class="error" id="login-message"></p><button type="submit">Sign in</button></form></section>`;
    document.getElementById('login-form').addEventListener('submit', async event => {
      event.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      try { const result = await api('login', { method:'POST', body:JSON.stringify({ username, password }) }); showDashboard(result.user); }
      catch (error) { document.getElementById('login-message').textContent = error.message; }
    });
  }

  function showDashboard(user) {
    app.innerHTML = `<section class="login"><h1 class="brand">Welcome, ${escapeHtml(user.name)}</h1><h2>Staff Request Portal</h2><p>You are signed in as ${escapeHtml(user.role)}.</p><p class="muted">Your administrator account is ready.</p><button id="logout" type="button">Sign out</button></section>`;
    document.getElementById('logout').addEventListener('click', async () => { await fetch('/api/logout'); showLogin(); });
  }

  function showSetup(departments) {
    app.innerHTML = `<section class="login"><h1 class="brand">Broad Concept Hub</h1><h2>Create the first administrator account</h2><p class="muted">This is a one-time step. The department selection only records your Hub affiliation. Your role will be Administrator.</p><form id="setup-form"><label>Full name<input id="setup-name" required></label><label>Username<input id="setup-username" required autocomplete="username"></label><label>Password<input id="setup-password" type="password" required minlength="12" autocomplete="new-password"></label><label>Department<select id="setup-department" required>${departments.map(item=>`<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')}</select></label><p class="error" id="setup-message"></p><button type="submit">Create administrator account</button></form></section>`;
    document.getElementById('setup-form').addEventListener('submit', async event => {
      event.preventDefault();
      const name = document.getElementById('setup-name').value.trim();
      const username = document.getElementById('setup-username').value.trim();
      const password = document.getElementById('setup-password').value;
      const department_id = Number(document.getElementById('setup-department').value);
      if (!name || !username || !password || !department_id) { document.getElementById('setup-message').textContent = 'Complete all required fields.'; return; }
      try { await api('setup', { method:'POST', body:JSON.stringify({ name, username, password, department_id }) }); showLogin(); }
      catch (error) { document.getElementById('setup-message').textContent=error.message; }
    });
  }

  (async () => {
    try {
      const status = await api('setup-status');
      if (status.setupComplete) { showLogin(); return; }
      const data = await api('setup-data');
      if (!data.items?.length) throw new Error('No active departments were found in the portal database.');
      showSetup(data.items);
    } catch (error) {
      app.innerHTML = `<section class="login"><h1 class="brand">Broad Concept Hub</h1><h2>Setup check failed</h2><p class="error">${escapeHtml(error.message)}</p></section>`;
    }
  })();
})();
