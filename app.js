(() => {
  const app = document.getElementById('app');

  async function request(path, options = {}) {
    const response = await fetch(`/api/${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  function signInScreen() {
    app.innerHTML = `
      <section class="login">
        <h1 class="brand">Broad Concept Hub</h1>
        <h2>Staff Request Portal</h2>
        <p class="muted">Sign in with your staff account.</p>
        <form id="sign-in-form">
          <label>Username<input id="sign-in-username" required autocomplete="username"></label>
          <label>Password<input id="sign-in-password" type="password" required autocomplete="current-password"></label>
          <p class="error" id="sign-in-error"></p>
          <button type="submit">Sign in</button>
        </form>
        <p><button id="show-recovery" type="button">Reset administrator password</button></p>
      </section>`;

    document.getElementById('sign-in-form').addEventListener('submit', async event => {
      event.preventDefault();
      const error = document.getElementById('sign-in-error');
      error.textContent = '';
      try {
        const user = await request('login', {
          method: 'POST',
          body: JSON.stringify({
            username: document.getElementById('sign-in-username').value.trim(),
            password: document.getElementById('sign-in-password').value
          })
        });
        signedInScreen(user.user);
      } catch (cause) {
        error.textContent = cause.message;
      }
    });
    document.getElementById('show-recovery').addEventListener('click', recoveryScreen);
  }

  function recoveryScreen() {
    app.innerHTML = `
      <section class="login">
        <h1 class="brand">Administrator password reset</h1>
        <p class="muted">Use the recovery code stored in the Cloudflare secret named ADMIN_RESET_CODE.</p>
        <form id="recovery-form">
          <label>Recovery code<input id="recovery-code" type="password" required autocomplete="off"></label>
          <label>New password<input id="recovery-password" type="password" minlength="12" required autocomplete="new-password"></label>
          <p class="error" id="recovery-error"></p>
          <button type="submit">Set new password</button>
        </form>
        <p><button id="back-to-sign-in" type="button">Back to sign in</button></p>
      </section>`;

    document.getElementById('recovery-form').addEventListener('submit', async event => {
      event.preventDefault();
      const error = document.getElementById('recovery-error');
      error.textContent = '';
      try {
        await request('recover', {
          method: 'POST',
          body: JSON.stringify({
            code: document.getElementById('recovery-code').value,
            password: document.getElementById('recovery-password').value
          })
        });
        signInScreen();
      } catch (cause) {
        error.textContent = cause.message;
      }
    });
    document.getElementById('back-to-sign-in').addEventListener('click', signInScreen);
  }

  function signedInScreen(user) {
    app.innerHTML = `<section class="login"><h1 class="brand">Welcome, ${String(user.name).replace(/</g, '&lt;')}</h1><h2>Staff Request Portal</h2><p>You are signed in as ${String(user.role).replace(/</g, '&lt;')}.</p><p class="muted">Your administrator account is working. The request-management screens will be restored after access is confirmed.</p><button id="sign-out" type="button">Sign out</button></section>`;
    document.getElementById('sign-out').addEventListener('click', async () => {
      await fetch('/api/logout');
      signInScreen();
    });
  }

  signInScreen();
})();
