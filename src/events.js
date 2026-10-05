'use strict';

// Event envelope modelled on the reference bus message
// ({from, to, type, subject, body, timestamp}) and post record
// ({id, content, wallet, type, ts, block}), with `wallet` replaced by `source`.

const { canonical, sha256 } = require('./hash');

const TYPES = ['update', 'request', 'reply', 'alert', 'file'];

function eventId({ type, subject, source, body, ts }) {
  return sha256(canonical({ type, subject, source, body, ts }));
}

function makeEvent({ type, subject, source = 'local-cli', body = {}, ts = Date.now() }) {
  const event = { type, subject, source, body, ts };
  validateEvent({ ...event, id: eventId(event) });
  return { id: eventId(event), ...event, block: null };
}

function validateEvent(event) {
  if (!TYPES.includes(event.type)) throw new Error(`invalid event type: ${event.type}`);
  if (typeof event.subject !== 'string' || !event.subject) throw new Error('event subject is required');
  if (typeof event.source !== 'string' || !event.source) throw new Error('event source is required');
  if (event.body === null || typeof event.body !== 'object') throw new Error('event body must be an object');
  if (!Number.isInteger(event.ts)) throw new Error('event ts must be an integer (ms)');
  if (event.id !== eventId(event)) throw new Error(`event id mismatch for ${event.id}`);
}

module.exports = { TYPES, eventId, makeEvent, validateEvent };
