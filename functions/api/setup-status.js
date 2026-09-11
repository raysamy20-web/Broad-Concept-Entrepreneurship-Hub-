export async function onRequestGet({ env }) {
  try {
    const row = await env.PORTAL_DB.prepare('SELECT COUNT(*) AS total FROM staff').first();
    return Response.json({ setupComplete: Number(row.total) > 0 }, {
      headers: { 'cache-control': 'no-store' }
    });
  } catch {
    return Response.json({ error: 'The portal database is not ready.' }, { status: 500 });
  }
}
