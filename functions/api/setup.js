const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const HASH_ITERATIONS = 100000;
const hex = value => [...new Uint8Array(value)].map(byte => byte.toString(16).padStart(2, '0')).join('');

async function createPasswordHash(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = hex(saltBytes);
  const passwordKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: HASH_ITERATIONS, hash: 'SHA-256' }, passwordKey, 256);
  return `pbkdf2$${HASH_ITERATIONS}$${salt}$${hex(bits)}`;
}

export async function onRequestPost({ request, env }) {
  try {
    const existing = await env.PORTAL_DB.prepare('SELECT COUNT(*) AS total FROM staff').first();
    if (Number(existing.total) > 0) return json({ error: 'Initial setup is already complete. Sign in with the administrator account.' }, 409);
    const body = await request.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const departmentId = Number(body.department_id);
    if (!name || !username || password.length < 12 || !Number.isInteger(departmentId) || departmentId < 1) return json({ error: 'Enter your name, username, a password of at least 12 characters, and a department.' }, 400);
    const department = await env.PORTAL_DB.prepare('SELECT id FROM departments WHERE id = ? AND active = 1').bind(departmentId).first();
    if (!department) return json({ error: 'Select an active department.' }, 400);
    const passwordHash = await createPasswordHash(password);
    await env.PORTAL_DB.prepare("INSERT INTO staff (name, username, password_hash, role, department_id, active) VALUES (?, ?, ?, 'Administrator', ?, 1)").bind(name, username, passwordHash, departmentId).run();
    return json({ ok: true }, 201);
  } catch (error) {
    return json({ error: `Setup error: ${String(error.message || error)}` }, 500);
  }
}
