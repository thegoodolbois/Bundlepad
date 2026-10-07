'use strict';

// Localhost-only API whose shapes follow the reference docs:
//   GET  /api/chain/template          {height, difficulty, prevHash, timestamp}
//   GET  /api/chain/events?limit&offset {events, total, limit, offset}
//   POST /api/chain/events            {ok, event}  (queued; alerts seal immediately)
//   GET  /api/chain/stats             {total, last_24h, last_event}
//   GET  /api/chain/blocks/:height
//
// Launch API (plan/follow_up/follow_up_2.md). Every POST is checked against a
// wallet signature, and bind/commit also against a Google ID token:
//   GET  /api/launch/nonce             {nonce, expiresAt}
//   GET  /api/launch/dashboard[?id]    the shape index.html reads
//   POST /api/launch/:id/bind          {google, wallet, nonce, signature}
//   POST /api/launch/:id/commit        {google, wallet, sol, signature}
//   POST /api/launch/:id/cancel        {wallet, signature}
//   POST /api/launch/:id/vote          {wallet, proposal, choice, signature}

const http = require('node:http');
const { makeEvent } = require('./events');
const { tip, enqueue, seal } = require('./chain');
const { verifyGoogleIdToken } = require('./launch/crypto');

function allEvents(store) {
  const events = [];
  for (const block of store.blocks()) events.push(...block.events);
  return events;
}

async function handleLaunch(launches, req, url, body, verifyGoogle) {
  if (req.method === 'GET' && url.pathname === '/api/launch/nonce') return [200, launches.issueNonce()];
  if (req.method === 'GET' && url.pathname === '/api/launch/dashboard') {
    return [200, launches.dashboard(url.searchParams.get('id') ?? undefined)];
  }
  const match = url.pathname.match(/^\/api\/launch\/([a-z0-9-]+)\/(bind|commit|cancel|vote)$/);
  if (req.method !== 'POST' || !match) return null;
  const [, id, action] = match;
  const input = JSON.parse(body || '{}');
  if (action === 'bind' || action === 'commit') {
    // With requireGoogle off (small private launches), the wallet itself is the identity.
    const cfg = launches.config();
    const sub = cfg.requireGoogle ? (await verifyGoogle(input.google, cfg.googleClientId)).sub : `wallet:${input.wallet}`;
    return [200, { ok: true, result: launches[action](id, { ...input, sub }) }];
  }
  return [200, { ok: true, result: launches[action](id, input) }];
}

async function handle(store, req, body, { launches = null, verifyGoogle = verifyGoogleIdToken } = {}) {
  const url = new URL(req.url, 'http://localhost');
  if (launches && url.pathname.startsWith('/api/launch/')) {
    const res = await handleLaunch(launches, req, url, body, verifyGoogle);
    if (res) return res;
  }
  if (req.method === 'GET' && url.pathname === '/api/chain/template') {
    const t = tip(store);
    return [200, { height: t.header.height + 1, difficulty: store.config().difficulty, prevHash: t.hash, timestamp: Date.now() }];
  }
  if (req.method === 'GET' && url.pathname === '/api/chain/events') {
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 30), 100);
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const events = allEvents(store).reverse();
    return [200, { events: events.slice(offset, offset + limit), total: events.length, limit, offset }];
  }
  if (req.method === 'POST' && url.pathname === '/api/chain/events') {
    const input = JSON.parse(body || '{}');
    const event = makeEvent({ type: input.type, subject: input.subject, source: input.source ?? 'http', body: input.body ?? {} });
    store.withLock(() => {
      enqueue(store, event);
      if (event.type === 'alert') seal(store);
    });
    return [200, { ok: true, event }];
  }
  if (req.method === 'GET' && url.pathname === '/api/chain/stats') {
    const events = allEvents(store);
    const since = Date.now() - 86_400_000;
    const last = events[events.length - 1];
    return [200, { total: events.length, last_24h: events.filter((e) => e.ts >= since).length, last_event: last ? { id: last.id, subject: last.subject, ts: last.ts } : null }];
  }
  const match = url.pathname.match(/^\/api\/chain\/blocks\/(\d+)$/);
  if (req.method === 'GET' && match) {
    const height = Number(match[1]);
    if (height > store.height()) return [404, { error: 'no such block' }];
    return [200, store.readBlock(height)];
  }
  return [404, { error: 'not found' }];
}

const MAX_BODY = 64 * 1024;

// Binds to localhost unless a host is given. `allowOrigin` (e.g. the GitHub
// Pages origin) is the only browser origin allowed to call the API.
function serve(store, port, { host = '127.0.0.1', launches = null, allowOrigin = '' } = {}) {
  const server = http.createServer((req, res) => {
    const headers = { 'content-type': 'application/json' };
    if (allowOrigin) Object.assign(headers, { 'access-control-allow-origin': allowOrigin, 'access-control-allow-headers': 'content-type', vary: 'origin' });
    if (req.method === 'OPTIONS') { res.writeHead(204, headers); res.end(); return; }
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) req.destroy();
    });
    req.on('end', async () => {
      let status, payload;
      try { [status, payload] = await handle(store, req, body, { launches }); } catch (err) { [status, payload] = [400, { error: err.message }]; }
      res.writeHead(status, headers);
      res.end(JSON.stringify(payload));
    });
  });
  server.listen(port, host);
  return server;
}

module.exports = { serve, handle };
