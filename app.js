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
    app.innerHTML = `<section class="login"><h1 class="brand">Broad Concept Hub</h1><h2>Staff Request Portal</h2><p class="muted">Sign in with your staff account.</p><form id="login-form"><label>Username<input id="username" required autocomplete="username"></label><label>Password<input id="password" type="password" required autocomplete="current-password"></label><p class="error" id="message"></p><button type="submit">Sign in</button></form></section>`;
    document.getElementById('login-form').addEventListener('submit', async event => {
      event.preventDefault();
      try { const result = await api('login', { method:'POST', body:JSON.stringify({ username: username.value, password: password.value }) }); showDashboard(result.user); }
      catch (error) { message.textContent = error.message; }
    });
  }
  function showDashboard(user) {
    app.innerHTML = `<section class="login"><h1 class="brand">Welcome, ${escapeHtml(user.name)}</h1><h2>Staff Request Portal</h2><p>You are signed in as ${escapeHtml(user.role)}.</p><p class="muted">Your administrator account is ready.</p><button id="logout" type="button">Sign out</button></section>`;
    document.getElementById('logout').addEventListener('click', async () => { await fetch('/api/logout'); showLogin(); });
  }
  function showSetup(departments) {
    app.innerHTML = `<section class="login"><h1 class="brand">Broad Concept Hub</h1><h2>Create the first administrator account</h2><p class="muted">This one-time step lets you manage staff accounts and requests.</p><form id="setup-form"><label>Full name<input id="name" required></label><label>Username<input id="username" required autocomplete="username"></label><label>Password<input id="password" type="password" required minlength="12" autocomplete="new-password"></label><label>Department<select id="department">${departments.map(item=>`<option value="${item.id}">${escapeHtml(item.name)}</option>`).join('')}</select></label><p class="error" id="message"></p><button type="submit">Create administrator account</button></form></section>`;
    document.getElementById('setup-form').addEventListener('submit', async event => { event.preventDefault(); try { await api('setup', { method:'POST', body:JSON.stringify({ name:name.value, username:username.value, password:password.value, department_id:department.value }) }); showLogin(); } catch (error) { message.textContent=error.message; } });
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
