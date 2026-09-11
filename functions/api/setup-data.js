export async function onRequestGet({ env }) {
  try {
    const result = await env.PORTAL_DB
      .prepare('SELECT id, name FROM departments WHERE active = 1 ORDER BY name')
      .all();
    return Response.json({ items: result.results || [] }, {
      headers: { 'cache-control': 'no-store' }
    });
  } catch {
    return Response.json({ error: 'The portal database is not ready.' }, { status: 500 });
  }
}
