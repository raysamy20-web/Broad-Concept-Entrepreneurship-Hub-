(() => {
  'use strict';
  const form = document.getElementById('login-form');
  const message = document.getElementById('message');
  const app = document.getElementById('app');

  async function api(path, options = {}) {
    const response = await fetch(`/api/${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function showDashboard(user) {
    app.innerHTML = `
      <section class="login">
        <h1 class="brand">Welcome, ${escapeHtml(user.name)}</h1>
        <h2>Staff Request Portal</h2>
        <p>You are signed in as ${escapeHtml(user.role)}.</p>
        <p class="muted">The initial portal setup is complete. Request screens will be available after the first administrator account is configured.</p>
        <button id="logout-button" type="button">Sign out</button>
      </section>`;
    document.getElementById('logout-button').addEventListener('click', async () => {
      await fetch('/api/logout');
      window.location.reload();
    });
  }

  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    message.textContent = '';
    const button = form.querySelector('button');
    button.disabled = true;
    try {
      const result = await api('login', {
        method: 'POST',
        body: JSON.stringify({
          username: document.getElementById('username').value,
          password: document.getElementById('password').value
        })
      });
      showDashboard(result.user);
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
})();
