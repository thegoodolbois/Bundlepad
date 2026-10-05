'use strict';

// Localhost-only API whose shapes follow the reference docs:
//   GET  /api/chain/template          {height, difficulty, prevHash, timestamp}
//   GET  /api/chain/events?limit&offset {events, total, limit, offset}
//   POST /api/chain/events            {ok, event}  (queued; alerts seal immediately)
//   GET  /api/chain/stats             {total, last_24h, last_event}
//   GET  /api/chain/blocks/:height

const http = require('node:http');
const { makeEvent } = require('./events');
const { tip, enqueue, seal } = require('./chain');

function allEvents(store) {
  const events = [];
  for (const block of store.blocks()) events.push(...block.events);
  return events;
}

function handle(store, req, body) {
  const url = new URL(req.url, 'http://localhost');
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

function serve(store, port) {
  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      let status, payload;
      try { [status, payload] = handle(store, req, body); } catch (err) { [status, payload] = [400, { error: err.message }]; }
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(payload));
    });
  });
  server.listen(port, '127.0.0.1');
  return server;
}

module.exports = { serve, handle };
