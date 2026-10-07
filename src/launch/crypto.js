'use strict';

// Signature checks for the launch backend: ed25519 wallet signatures
// (Solana signMessage) and Google ID tokens (RS256 JWTs).

const crypto = require('node:crypto');
const base58 = require('./base58');

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

// Accepts a signature as base58, padded base64, a byte array or a Buffer.
function signatureBytes(sig) {
  if (Buffer.isBuffer(sig) || Array.isArray(sig) || sig instanceof Uint8Array) return Buffer.from(sig);
  if (typeof sig !== 'string') throw new Error('signature is required');
  // 64 bytes in base64 is always 86 chars + "=="; base58 never contains "=".
  if (/^[A-Za-z0-9+/]{86}==$/.test(sig)) return Buffer.from(sig, 'base64');
  return base58.decode(sig);
}

function walletKey(address) {
  const raw = base58.decode(address);
  if (raw.length !== 32) throw new Error(`not a Solana address: ${address}`);
  return crypto.createPublicKey({ key: { kty: 'OKP', crv: 'Ed25519', x: raw.toString('base64url') }, format: 'jwk' });
}

function verifyWalletSignature(address, message, signature) {
  const sig = signatureBytes(signature);
  if (sig.length !== 64) return false;
  return crypto.verify(null, Buffer.from(message, 'utf8'), walletKey(address), sig);
}

let certCache = { keys: null, expires: 0 };

async function googleKeys(fetchImpl = fetch) {
  if (certCache.keys && Date.now() < certCache.expires) return certCache.keys;
  const res = await fetchImpl(GOOGLE_CERTS_URL);
  if (!res.ok) throw new Error(`could not fetch Google certs (${res.status})`);
  const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '')?.[1] ?? 3600);
  certCache = { keys: (await res.json()).keys, expires: Date.now() + maxAge * 1000 };
  return certCache.keys;
}

// Verifies a Google ID token and returns its payload. `getKeys` is injectable for tests.
async function verifyGoogleIdToken(token, clientId, { getKeys = googleKeys, now = Date.now() } = {}) {
  if (!clientId) throw new Error('Google client ID is not configured');
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('malformed ID token');
  const [h, p, s] = parts;
  const header = JSON.parse(Buffer.from(h, 'base64url'));
  const payload = JSON.parse(Buffer.from(p, 'base64url'));
  if (header.alg !== 'RS256') throw new Error(`unsupported ID token alg ${header.alg}`);
  const jwk = (await getKeys()).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('ID token signed with an unknown key');
  const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  if (!crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), key, Buffer.from(s, 'base64url'))) throw new Error('ID token signature is invalid');
  if (!GOOGLE_ISSUERS.includes(payload.iss)) throw new Error('ID token issuer is not Google');
  if (payload.aud !== clientId) throw new Error('ID token is for a different client');
  if (!(payload.exp * 1000 > now)) throw new Error('ID token has expired');
  if (!payload.sub) throw new Error('ID token has no subject');
  return payload;
}

module.exports = { verifyWalletSignature, verifyGoogleIdToken, googleKeys, walletKey };
